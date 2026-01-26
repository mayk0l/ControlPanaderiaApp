import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Cliente admin con service_role key
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada");
  }
  
  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Verificar que el usuario actual es admin
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "No autenticado", status: 401 };
  }
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  if (profile?.role !== "admin") {
    return { error: "No autorizado", status: 403 };
  }
  
  return { user, profile };
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const authCheck = await verifyAdmin();
    if ("error" in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const body = await request.json();
    const { email, password, name, username, role = "vendedor" } = body;

    if (!email || !password || !name || !username) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();

    // Verificar si el usuario ya existe en auth
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      // Usuario ya existe en auth, verificar si tiene perfil
      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("id", existingUser.id)
        .single();

      if (existingProfile) {
        return NextResponse.json(
          { error: "Ya existe un usuario con este correo electrónico" },
          { status: 400 }
        );
      }

      // Usuario existe pero sin perfil, usar su ID
      userId = existingUser.id;
    } else {
      // Crear usuario en auth
      const { data: newUser, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirmar email
      });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }

      userId = newUser.user.id;
    }

    // Crear perfil (usar upsert para evitar duplicados)
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert({
        id: userId,
        name,
        username,
        role,
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      // Si el usuario fue recién creado, hacer rollback
      if (!existingUser) {
        await adminClient.auth.admin.deleteUser(userId);
      }
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        name,
        username,
        role,
      },
    });
  } catch (error) {
    console.error("Error creando usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar usuario (password o rol)
export async function PATCH(request: NextRequest) {
  try {
    const authCheck = await verifyAdmin();
    if ("error" in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const body = await request.json();
    const { userId, password, role, name } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    const adminClient = getAdminClient();

    // Actualizar contraseña si se proporciona
    if (password) {
      const { error: pwError } = await adminClient.auth.admin.updateUserById(
        userId,
        { password }
      );
      if (pwError) {
        return NextResponse.json({ error: pwError.message }, { status: 400 });
      }
    }

    // Actualizar perfil si hay cambios
    if (role || name) {
      const updates: Record<string, string> = {};
      if (role) updates.role = role;
      if (name) updates.name = name;

      const { error: profileError } = await adminClient
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await verifyAdmin();
    if ("error" in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    // No permitir eliminarse a sí mismo
    if (userId === authCheck.user.id) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propia cuenta" },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();

    // Eliminar usuario (el perfil se elimina por CASCADE)
    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
