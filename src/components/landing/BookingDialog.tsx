import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Video, User, Mail, Phone, Building, Calendar as CalendarIcon, Check } from "lucide-react";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timeSlots = [
  { time: "09:00", available: true },
  { time: "09:30", available: true },
  { time: "10:00", available: false },
  { time: "10:30", available: true },
  { time: "11:00", available: true },
  { time: "13:30", available: true },
  { time: "14:00", available: true },
  { time: "14:30", available: false },
  { time: "15:00", available: true },
  { time: "15:30", available: true },
  { time: "16:00", available: true },
  { time: "16:30", available: true },
  { time: "17:00", available: true },
];

export function BookingDialog({ open, onOpenChange }: BookingDialogProps) {
  const [step, setStep] = useState<"datetime" | "details" | "confirmation">("datetime");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Veuillez sélectionner une date et un créneau");
      return;
    }
    setStep("details");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setStep("confirmation");
    toast.success("Demande de démo envoyée avec succès !");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("datetime");
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",
      });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-navy-deep border-cyan-electric/30 p-0">
        {step === "datetime" && (
          <div className="grid md:grid-cols-[350px,1fr] gap-0">
            {/* Left side - Info */}
            <div className="p-8 bg-gradient-to-br from-cyan-electric/10 to-navy-deep border-r border-cyan-electric/20">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-electric/30 to-cyan-electric/10 flex items-center justify-center">
                    <User className="w-7 h-7 text-cyan-electric" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Avec</div>
                    <div className="font-bold text-foreground text-lg">Équipe LUMA</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold gradient-text">Démo personnalisée de LUMA</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Découvrez comment LUMA peut transformer votre approche commerciale terrain.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <Clock className="w-5 h-5 text-cyan-electric" />
                    <span className="font-medium">30 minutes</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <Video className="w-5 h-5 text-cyan-electric" />
                    <span className="font-medium">Google Meet</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-cyan-electric/20">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Vous recevrez un email de confirmation avec le lien de la réunion et un rappel 24h avant.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Calendar & Time */}
            <div className="p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Choisissez votre créneau
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Sélectionnez une date puis un horaire qui vous convient
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Calendar */}
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                    locale={fr}
                    className="rounded-lg border border-cyan-electric/20 bg-navy-deep/50 p-3"
                  />
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-cyan-electric" />
                      <span className="text-sm font-semibold text-foreground">
                        {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot.time)}
                          className={`h-12 ${
                            selectedTime === slot.time
                              ? "bg-cyan-electric text-navy-deep hover:bg-cyan-glow"
                              : "border-cyan-electric/30 hover:bg-cyan-electric/10 hover:border-cyan-electric/50"
                          } ${!slot.available ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDate && selectedTime && (
                  <Button
                    onClick={handleNext}
                    className="w-full btn-hero h-12 text-base"
                  >
                    Continuer
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {step === "details" && (
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-foreground">
                Vos informations
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Dernière étape : quelques informations pour personnaliser votre démo
              </DialogDescription>
            </DialogHeader>

            {/* Selected date/time recap */}
            <div className="mb-6 p-4 rounded-lg bg-cyan-electric/10 border border-cyan-electric/30">
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon className="w-5 h-5 text-cyan-electric" />
                <span className="font-semibold text-foreground">
                  {selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })} à {selectedTime}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Nom complet <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-electric" />
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 bg-navy-deep/50 border-cyan-electric/30 focus:border-cyan-electric"
                      placeholder="Jean Dupont"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-electric" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 bg-navy-deep/50 border-cyan-electric/30 focus:border-cyan-electric"
                      placeholder="jean.dupont@entreprise.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    Téléphone <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-electric" />
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 bg-navy-deep/50 border-cyan-electric/30 focus:border-cyan-electric"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-foreground">
                    Entreprise
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-electric" />
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="pl-10 bg-navy-deep/50 border-cyan-electric/30 focus:border-cyan-electric"
                      placeholder="Votre entreprise"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground">
                  Message (optionnel)
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-navy-deep/50 border-cyan-electric/30 focus:border-cyan-electric min-h-24"
                  placeholder="Parlez-nous de vos besoins..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("datetime")}
                  className="flex-1 border-cyan-electric/30 hover:bg-cyan-electric/10"
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  className="flex-1 btn-hero"
                >
                  Confirmer la démo
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === "confirmation" && (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-electric/30 to-cyan-electric/10 flex items-center justify-center">
                <Check className="w-10 h-10 text-cyan-electric" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-3xl font-bold gradient-text">C'est confirmé !</h3>
                <p className="text-lg text-muted-foreground">
                  Votre démo est réservée pour le
                </p>
                <div className="p-4 rounded-lg bg-cyan-electric/10 border border-cyan-electric/30 inline-block">
                  <p className="text-xl font-bold text-foreground">
                    {selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                  <p className="text-lg text-cyan-electric font-semibold">
                    à {selectedTime}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground max-w-md">
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-electric mt-0.5 flex-shrink-0" />
                  Email de confirmation envoyé à <strong className="text-foreground">{formData.email}</strong>
                </p>
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-electric mt-0.5 flex-shrink-0" />
                  Lien Google Meet inclus dans l'email
                </p>
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-electric mt-0.5 flex-shrink-0" />
                  Rappel automatique 24h avant
                </p>
              </div>

              <Button
                onClick={handleClose}
                className="btn-hero mt-6"
              >
                Parfait, merci !
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
