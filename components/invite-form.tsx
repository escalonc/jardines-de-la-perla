"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { generateUniqueId } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
// Fixed values as per requirements
const FIXED_TITLE = "Jardines de La Perla";
const FIXED_DESCRIPTION = "código de invitación";

interface InviteFormProps {
  onInviteCreated: (invite: Invite) => void;
}

const inviteFormSchema = z.object({
  name: z
    .string({
      required_error: "El nombre es requerido",
    })
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(50, { message: "El nombre no puede tener más de 50 caracteres" }),
  guests: z
    .number({
      required_error: "El número de acompañantes es requerido",
    })
    .min(0, { message: "El número de acompañantes no puede ser negativo" })
    .max(10, { message: "No se permiten más de 10 acompañantes" }),
  isFrequent: z.boolean(),
});

export function InviteForm({ onInviteCreated }: InviteFormProps) {
  const form = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      guests: 0,
      isFrequent: false,
    },
  });

  const [generatedInvite, setGeneratedInvite] = useState<Invite | null>(null);
  const isMobile = useIsMobile();

  function onSubmit(values: z.infer<typeof inviteFormSchema>) {
    const newInvite: Invite = {
      id: generateUniqueId(),
      name: values.name,
      guests: values.guests,
      title: FIXED_TITLE,
      description: FIXED_DESCRIPTION,
      createdAt: new Date().toISOString(),
    };

    setGeneratedInvite(newInvite);
  }

  const handleSave = () => {
    if (generatedInvite) {
      onInviteCreated(generatedInvite);
      form.reset();
      setGeneratedInvite(null);
    }
  };

  // // Mobile-optimized layout that shows form and QR side by side
  // if (isMobile) {
  //   return (
  //     <div>
  //       {/* Mobile layout - QR code appears next to form */}
  //       <div className="flex flex-col space-y-4">
  //         {/* Form and QR in a single card */}
  //         <Card>
  //           <CardHeader className="pb-2">
  //             <CardTitle className="text-lg">Create New Invite</CardTitle>
  //             <CardDescription className="text-xs">
  //               for {FIXED_TITLE}
  //             </CardDescription>
  //           </CardHeader>
  //           <CardContent className="pb-3">
  //             <div className="flex flex-col sm:flex-row gap-4">
  //               {/* Form section */}
  //               <div className="flex-1">
  //                 <form onSubmit={handleSubmit} className="space-y-3">
  //                   <div className="space-y-1">
  //                     <Label htmlFor="name" className="text-sm">
  //                       Invitee Name
  //                     </Label>
  //                     <Input
  //                       id="name"
  //                       value={name}
  //                       onChange={(e) => setName(e.target.value)}
  //                       placeholder="Enter name"
  //                       required
  //                       className="h-8 text-sm"
  //                     />
  //                   </div>

  //                   <div className="space-y-1">
  //                     <Label htmlFor="visits" className="text-sm">
  //                       Visits
  //                     </Label>
  //                     <Input
  //                       id="visits"
  //                       type="number"
  //                       min="1"
  //                       value={guests}
  //                       onChange={(e) => setGuests(parseInt(e.target.value))}
  //                       required
  //                       className="h-8 text-sm"
  //                     />
  //                   </div>

  //                   <Button type="submit" className="w-full h-8 text-sm">
  //                     {generatedInvite ? "Update" : "Generate QR"}
  //                   </Button>
  //                 </form>
  //               </div>

  //               {/* QR code section */}
  //               <div className="flex-1 flex items-center justify-center">
  //                 {generatedInvite ? (
  //                   <div className="w-full">
  //                     <QRCodeDisplay invite={generatedInvite} compact={true} />
  //                     <div className="flex justify-between mt-2">
  //                       <Button
  //                         variant="outline"
  //                         onClick={() => setGeneratedInvite(null)}
  //                         className="text-xs h-7 px-2"
  //                       >
  //                         Cancel
  //                       </Button>
  //                       <Button
  //                         onClick={handleSave}
  //                         className="text-xs h-7 px-2"
  //                       >
  //                         Save
  //                       </Button>
  //                     </div>
  //                   </div>
  //                 ) : (
  //                   <div className="w-full h-[140px] border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/20">
  //                     <p className="text-xs text-muted-foreground text-center px-2">
  //                       QR code will appear here
  //                     </p>
  //                   </div>
  //                 )}
  //               </div>
  //             </div>
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </div>
  //   );
  // }

  // Desktop layout (unchanged)
  return (
    <div className="grid gap-6 lg:grid-cols-2 auto-rows-fr">
      {/* Form Card - Fixed height */}
      <Card className="h-[650px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Crear nueva invitación</CardTitle>
          <CardDescription>
            Complete el formulario para generar un código QR de invitación
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col pb-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de acompañantes</FormLabel>
                    <FormControl>
                      <Input
                        type="string"
                        placeholder="Ingrese el número de acompañantes"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          return field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFrequent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visitante frecuente</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Generar Código QR
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    form.reset();
                    setGeneratedInvite(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
          {generatedInvite ? (
            <QRCodeDisplay invite={generatedInvite} />
          ) : (
            <div className="w-full max-w-xs lg:h-[400px] border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/20">
              <p className="text-muted-foreground text-center px-4">
                Su código QR aparecerá aquí después de generarlo
              </p>
            </div>
          )}
          {/* <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="space-y-4 lg:flex-grow">
              <div className="space-y-2">
                <Label htmlFor="name-desktop">
                  Nombre de la persona invitada
                </Label>
                <Input
                  id="name-desktop"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ingrese el nombre"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests-desktop">
                  Número de acompañantes permitidos
                </Label>
                <Input
                  id="guests-desktop"
                  type="number"
                  min={0}
                  max={10}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests-desktop">
                  Número de acompañantes permitidos
                </Label>
                <Input
                  id="guests-desktop"
                  type="number"
                  min={0}
                  max={10}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="pt-6">
              <Button type="submit" className="w-full">
                Generar Código QR
              </Button>
            </div>
          </form> */}
        </CardContent>
      </Card>

      {/* QR Code Card */}
      <Card className="hidden h-[650px] lg:flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>
            {generatedInvite
              ? "Invitación generada"
              : "Vista previa del código QR"}
          </CardTitle>
          <CardDescription>
            {generatedInvite
              ? `Código QR para ${generatedInvite.name}`
              : "Complete el formulario para generar una invitación"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center py-8">
          {generatedInvite ? (
            <QRCodeDisplay invite={generatedInvite} />
          ) : (
            <div className="w-full max-w-xs h-[400px] border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/20">
              <p className="text-muted-foreground text-center px-4">
                Su código QR aparecerá aquí después de generarlo
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-shrink-0">
          {generatedInvite ? (
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={() => setGeneratedInvite(null)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          ) : (
            <div className="w-full text-center text-sm text-muted-foreground">
              Genera un código QR para habilitar las opciones de compartir
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
