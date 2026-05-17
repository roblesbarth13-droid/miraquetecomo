import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LogIn, Loader2, Eye, EyeOff, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

const setPasswordSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirmá tu contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [emailForPassword, setEmailForPassword] = useState("");

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const setPasswordForm = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleLoginSuccess = async (data: any) => {
    toast({
      title: "Bienvenido",
      description: `Hola ${data.user.businessName || data.user.firstName || 'de nuevo'}`,
    });
    if (data.user) {
      queryClient.setQueryData(["/api/auth/user"], data.user);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    if (data.user.userType === 'comercio') {
      navigate("/comercio");
    } else {
      navigate("/home");
    }
  };

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.needsPassword) {
          setNeedsPassword(true);
          setEmailForPassword(json.email || data.email);
          throw new Error("NEEDS_PASSWORD");
        }
        throw new Error(json.message || "Error al iniciar sesión");
      }
      return json;
    },
    onSuccess: handleLoginSuccess,
    onError: (error: Error) => {
      if (error.message === "NEEDS_PASSWORD") {
        toast({
          title: "Configurá tu contraseña",
          description: "Tu cuenta no tiene contraseña. Por favor, creá una para continuar.",
        });
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Email o contraseña incorrectos",
        variant: "destructive",
      });
    },
  });

  const setPasswordMutation = useMutation({
    mutationFn: async (data: SetPasswordFormValues) => {
      const res = await apiRequest("POST", "/api/auth/set-password", {
        email: emailForPassword,
        password: data.password,
      });
      return res.json();
    },
    onSuccess: handleLoginSuccess,
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo configurar la contraseña",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onSetPasswordSubmit = (data: SetPasswordFormValues) => {
    setPasswordMutation.mutate(data);
  };

  if (needsPassword) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-set-password">
        <Header />

        <main className="max-w-md mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Configurá tu contraseña
            </h1>
            <p className="text-muted-foreground">
              Tu cuenta <strong>{emailForPassword}</strong> necesita una contraseña
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Crear contraseña</CardTitle>
              <CardDescription>
                Creá una contraseña segura para acceder a tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...setPasswordForm}>
                <form onSubmit={setPasswordForm.handleSubmit(onSetPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={setPasswordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Mínimo 6 caracteres"
                              autoComplete="new-password"
                              {...field}
                              data-testid="input-new-password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={setPasswordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar contraseña</FormLabel>
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Repetí tu contraseña"
                            autoComplete="new-password"
                            {...field}
                            data-testid="input-confirm-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={setPasswordMutation.isPending}
                    data-testid="button-set-password"
                  >
                    {setPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar contraseña"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setNeedsPassword(false);
                      setEmailForPassword("");
                    }}
                    data-testid="button-back-to-login"
                  >
                    Volver al inicio de sesión
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-login">
      <Header />

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Iniciar sesión
          </h1>
          <p className="text-muted-foreground">
            Ingresá con tu email y contraseña
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acceder a tu cuenta</CardTitle>
            <CardDescription>
              Ingresá tus datos para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          {...field}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Tu contraseña"
                            {...field}
                            data-testid="input-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="button-submit-login"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>

                <div className="space-y-2 text-center text-sm text-muted-foreground">
                  <p>
                    ¿No tenés cuenta?{" "}
                    <Link href="/registro" className="text-primary hover:underline" data-testid="link-register-user">
                      Creá una acá
                    </Link>
                  </p>
                  <p>
                    ¿Sos comercio?{" "}
                    <Link href="/registro-comercio" className="text-primary hover:underline" data-testid="link-register-business">
                      Registrá tu negocio
                    </Link>
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
