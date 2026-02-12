import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle, XCircle, Clock, Loader2, QrCode, LogIn, Store } from "lucide-react";

type VerificationResult = {
  valid: boolean;
  purchase?: {
    id: number;
    pickupCode: string;
    pickedUp: string | null;
    offer: { title: string; discountedPrice: string };
    user: { firstName: string | null; lastName: string | null };
  };
  message?: string;
};

export default function VerificarQR() {
  const { code } = useParams<{ code: string }>();
  const { isAuthenticated, isBusiness, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const canVerify = !authLoading && isAuthenticated && isBusiness && !!code;

  const { data: result, isLoading: isVerifying } = useQuery<VerificationResult>({
    queryKey: ['/api/comercio/verificar', code?.toUpperCase()],
    enabled: canVerify,
    queryFn: async () => {
      const res = await fetch(`/api/comercio/verificar/${code!.toUpperCase()}`, {
        credentials: "include",
      });
      const data = await res.json();
      return data;
    },
  });

  const markAsPickedUpMutation = useMutation({
    mutationFn: async (purchaseId: number) => {
      return apiRequest("POST", `/api/comercio/retirar/${purchaseId}`);
    },
    onSuccess: () => {
      toast({
        title: "Retiro confirmado",
        description: "El pedido fue marcado como retirado.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/comercio/verificar', code?.toUpperCase()] });
      queryClient.invalidateQueries({ queryKey: ["/api/comercio/ventas"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo marcar el retiro.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4" data-testid="page-verificar-qr">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2" data-testid="text-page-title">
              <QrCode className="h-5 w-5" />
              Verificación de retiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isAuthenticated ? (
              <div className="text-center space-y-4" data-testid="section-not-authenticated">
                <LogIn className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground" data-testid="text-login-prompt">
                  Iniciá sesión con tu cuenta de comercio para verificar este código.
                </p>
                <Button onClick={() => navigate("/login")} className="w-full" data-testid="button-login-verify">
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar sesión
                </Button>
              </div>
            ) : !isBusiness ? (
              <div className="text-center space-y-4" data-testid="section-not-business">
                <Store className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground" data-testid="text-business-only">
                  Solo las cuentas de comercio pueden verificar códigos de retiro.
                </p>
                <Button onClick={() => navigate("/home")} variant="outline" className="w-full" data-testid="button-go-home">
                  Volver al inicio
                </Button>
              </div>
            ) : isVerifying ? (
              <div className="text-center space-y-4 py-8" data-testid="section-verifying">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Verificando código <span className="font-mono font-bold">{code?.toUpperCase()}</span>...</p>
              </div>
            ) : result ? (
              <div className="space-y-4" data-testid="section-result">
                {result.valid && result.purchase ? (
                  <div className="space-y-4">
                    <div className={`flex items-center gap-3 p-4 rounded-md ${
                      result.purchase.pickedUp
                        ? "bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800"
                        : "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                    }`} data-testid="status-verification-result">
                      {result.purchase.pickedUp ? (
                        <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-lg" data-testid="text-verified-code">{result.purchase.pickupCode}</span>
                          {result.purchase.pickedUp ? (
                            <Badge variant="secondary" data-testid="badge-already-picked">Ya retirado</Badge>
                          ) : (
                            <Badge className="bg-green-600" data-testid="badge-valid">Válido</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium" data-testid="text-verified-offer">{result.purchase.offer.title}</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-verified-client">
                        Cliente: {result.purchase.user.firstName} {result.purchase.user.lastName}
                      </p>
                      <p className="text-lg font-bold" data-testid="text-verified-price">
                        ${parseFloat(result.purchase.offer.discountedPrice).toLocaleString('es-AR')}
                      </p>
                      {result.purchase.pickedUp && (
                        <p className="text-sm text-muted-foreground" data-testid="text-verified-pickedup-date">
                          Retirado: {new Date(result.purchase.pickedUp).toLocaleString('es-AR')}
                        </p>
                      )}
                    </div>

                    {!result.purchase.pickedUp && (
                      <Button
                        className="w-full"
                        onClick={() => markAsPickedUpMutation.mutate(result.purchase!.id)}
                        disabled={markAsPickedUpMutation.isPending}
                        data-testid="button-confirm-pickup"
                      >
                        {markAsPickedUpMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Confirmando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirmar retiro
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-4 py-4" data-testid="section-invalid-code">
                    <XCircle className="h-12 w-12 text-destructive mx-auto" />
                    <p className="text-muted-foreground" data-testid="text-verification-error">
                      {result.message || "Código no válido"}
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/comercio")}
                  data-testid="button-go-panel"
                >
                  Ir al panel del comercio
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}