import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Upload, Loader2, ImagePlus, X, Camera, FolderOpen } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { categoryDisplayNames } from "@shared/schema";

const formSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  category: z.enum(["panaderia", "verduleria", "carniceria", "rotiseria", "supermercado"], {
    required_error: "Seleccioná una categoría",
  }),
  originalPrice: z.string().refine((val) => parseFloat(val) > 0, {
    message: "El precio debe ser mayor a 0",
  }),
  discountPercentage: z.coerce.number().min(1, "El descuento debe ser al menos 1%").max(90, "El descuento no puede superar el 90%"),
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1").max(100, "La cantidad no puede superar 100"),
  pickupTimeStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido"),
  pickupTimeEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido"),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateOffer() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading, isBusiness } = useAuth();
  const { toast } = useToast();
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      originalPrice: "",
      discountPercentage: 30,
      quantity: 1,
      pickupTimeStart: "18:00",
      pickupTimeEnd: "20:00",
      imageUrl: "",
    },
  });

  const originalPrice = form.watch("originalPrice");
  const discountPercentage = form.watch("discountPercentage");

  useEffect(() => {
    const price = parseFloat(originalPrice) || 0;
    const discount = discountPercentage || 0;
    const discounted = price * (1 - discount / 100);
    setCalculatedPrice(Math.round(discounted * 100) / 100);
  }, [originalPrice, discountPercentage]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Acceso restringido",
        description: "Necesitás iniciar sesión para acceder.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    } else if (!authLoading && isAuthenticated && !isBusiness) {
      navigate("/convertir-comercio");
    }
  }, [authLoading, isAuthenticated, isBusiness, navigate, toast]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "La imagen no puede superar los 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    form.setValue("imageUrl", "");
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("image", file);
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Error al subir la imagen");
    }
    
    const data = await response.json();
    return data.imageUrl;
  };

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        ...data,
        discountedPrice: calculatedPrice.toString(),
      };
      return await apiRequest("POST", "/api/ofertas", payload);
    },
    onSuccess: () => {
      // Clean up file state
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      
      toast({
        title: "Oferta creada",
        description: "Tu oferta ya está visible para los usuarios.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ofertas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/comercio/ofertas"] });
      navigate("/comercio");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sesión expirada",
          description: "Por favor, ingresá de nuevo.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo crear la oferta. Intentá de nuevo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      let uploadedImageUrl: string | undefined = undefined;
      
      // Upload image if selected
      if (selectedFile) {
        setIsUploading(true);
        uploadedImageUrl = await uploadImage(selectedFile) || undefined;
        setIsUploading(false);
      }
      
      // Create offer with uploaded image URL (or empty if no image)
      const offerData = {
        ...data,
        imageUrl: uploadedImageUrl || "",
      };
      
      createMutation.mutate(offerData);
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Intentá de nuevo.",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-create-offer">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild data-testid="button-back-panel">
            <Link href="/comercio">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al panel
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Nueva oferta</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de la oferta</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Bolsón de verduras frescas"
                          {...field}
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describí qué incluye la oferta..."
                          className="min-h-24"
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Seleccioná una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(categoryDisplayNames).map(([value, label]) => (
                            <SelectItem key={value} value={value} data-testid={`option-category-${value}`}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio original ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            data-testid="input-original-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descuento (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="90"
                            {...field}
                            data-testid="input-discount"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {calculatedPrice > 0 && (
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Precio final con descuento:</p>
                    <p className="text-2xl font-bold text-primary" data-testid="text-calculated-price">
                      ${calculatedPrice.toLocaleString('es-AR')}
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad disponible</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          {...field}
                          data-testid="input-quantity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pickupTimeStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora inicio retiro</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            data-testid="input-pickup-start"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pickupTimeEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora fin retiro</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            data-testid="input-pickup-end"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Foto del producto (opcional)</Label>
                  <div className="flex flex-col gap-4">
                    {previewUrl ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                        <img
                          src={previewUrl}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                          data-testid="img-preview"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveImage}
                          data-testid="button-remove-image"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center gap-2">
                          <ImagePlus className="h-10 w-10 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground text-center px-4">
                            Sacá una foto o elegí de tu galería
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG, WebP o GIF (max 5MB)
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => cameraInputRef.current?.click()}
                            data-testid="button-camera"
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Sacar foto
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => fileInputRef.current?.click()}
                            data-testid="button-gallery"
                          >
                            <FolderOpen className="mr-2 h-4 w-4" />
                            Galería
                          </Button>
                        </div>
                      </div>
                    )}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileSelect}
                      className="hidden"
                      data-testid="input-camera"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileSelect}
                      className="hidden"
                      data-testid="input-image-file"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending || isUploading}
                  data-testid="button-submit-offer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo imagen...
                    </>
                  ) : createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Publicar oferta"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
