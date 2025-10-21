import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Video, User, Mail, Phone, Building, Calendar as CalendarIcon, Check, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

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

export function BookingSection() {
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

  const handleReset = () => {
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
  };

  return (
    <section id="demo" className="relative py-24 px-4 bg-gradient-to-b from-background via-primary/30 to-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Réservez votre <span className="gradient-text">démo personnalisée</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Échangez avec notre équipe et découvrez comment LUMA peut transformer votre activité
          </p>
        </div>

        {step === "datetime" && (
          <div className="grid lg:grid-cols-[400px,1fr] gap-8 max-w-6xl mx-auto">
            {/* Left side - Info */}
            <div className="glass-card p-8 space-y-6 border-cyan-electric/30 animate-fade-in flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-electric/30 to-cyan-electric/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-cyan-electric" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Avec</div>
                    <div className="font-bold text-foreground text-lg">Équipe LUMA</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-cyan-electric">Démo personnalisée</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Un échange de 30 minutes pour comprendre vos besoins et vous montrer comment LUMA peut vous aider à :
                  </p>
                  <ul className="space-y-2 text-sm text-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cyan-electric mt-0.5 flex-shrink-0" />
                      <span>Optimiser vos tournées commerciales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cyan-electric mt-0.5 flex-shrink-0" />
                      <span>Piloter votre activité terrain</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cyan-electric mt-0.5 flex-shrink-0" />
                      <span>Accéder aux créations en temps réel</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-cyan-electric/20">
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Clock className="w-4 h-4 text-cyan-electric" />
                  <span>30 minutes</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Video className="w-4 h-4 text-cyan-electric" />
                  <span>Visioconférence Google Meet</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <CalendarIcon className="w-4 h-4 text-cyan-electric" />
                  <span>Lien envoyé par email</span>
                </div>
              </div>
            </div>

            {/* Right side - Calendar & Time */}
            <div className="glass-card p-8 space-y-6 border-cyan-electric/30 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Choisissez votre créneau</h3>
                <p className="text-muted-foreground text-sm">Sélectionnez une date puis un horaire disponible</p>
              </div>

              <div className="grid md:grid-cols-[1.3fr,1fr] gap-6">
                {/* Calendar */}
                <div className="flex flex-col space-y-3">
                  <div className="text-xs font-semibold text-cyan-electric uppercase tracking-wide">Date</div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      const day = date.getDay();
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today || day === 0 || day === 6;
                    }}
                    locale={fr}
                    fromDate={new Date()}
                    className="rounded-lg border-0 p-0 w-full"
                    hidden={{ dayOfWeek: [0, 6] }}
                  />
                </div>

                {/* Time slots */}
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-cyan-electric uppercase tracking-wide mb-2">Horaires</div>
                    {!selectedDate && (
                      <p className="text-xs text-muted-foreground italic">
                        Sélectionnez d'abord une date
                      </p>
                    )}
                  </div>
                  {selectedDate && (
                    <div>
                      <div className="text-xs font-medium text-foreground mb-3">
                        {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                      </div>
                      <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            disabled={!slot.available}
                            onClick={() => handleTimeSelect(slot.time)}
                            className={`h-9 font-semibold transition-all text-sm ${
                              selectedTime === slot.time
                                ? "bg-cyan-electric text-navy-deep hover:bg-cyan-glow shadow-lg shadow-cyan-electric/40"
                                : "border-cyan-electric/30 hover:bg-cyan-electric/10 hover:border-cyan-electric/50"
                            } ${!slot.available ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedDate && selectedTime && (
                <div className="pt-4 border-t border-cyan-electric/20 animate-fade-in">
                  <div className="p-4 rounded-lg bg-cyan-electric/10 border border-cyan-electric/30 mb-4">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5 text-cyan-electric" />
                      <div>
                        <div className="text-xs text-muted-foreground">Rendez-vous prévu</div>
                        <div className="font-bold text-foreground text-sm">
                          {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })} à {selectedTime}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleNext}
                    className="w-full btn-hero h-12 text-base group"
                  >
                    Continuer
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === "details" && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="glass-card p-8 md:p-12 space-y-8 border-cyan-electric/30">
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-bold text-foreground">Vos informations</h3>
                <p className="text-muted-foreground">Dernière étape pour finaliser votre réservation</p>
              </div>

              {/* Selected date/time recap */}
              <div className="p-4 rounded-lg bg-cyan-electric/10 border border-cyan-electric/30 text-center">
                <div className="flex items-center justify-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-cyan-electric" />
                  <span className="font-semibold text-foreground">
                    {selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })} à {selectedTime}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground font-semibold">
                      Nom complet <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-electric" />
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10 bg-navy-deep/50 border-cyan-electric/30 focus:border-cyan-electric h-12"
                        placeholder="Jean Dupont"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-semibold">
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
                        className="pl-10 bg-navy-deep/50 border-cyan-electric/30 focus:border-cyan-electric h-12"
                        placeholder="jean.dupont@entreprise.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground font-semibold">
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
                        className="pl-10 bg-navy-deep/50 border-cyan-electric/30 focus:border-cyan-electric h-12"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-foreground font-semibold">
                      Entreprise
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-electric" />
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="pl-10 bg-navy-deep/50 border-cyan-electric/30 focus:border-cyan-electric h-12"
                        placeholder="Votre entreprise"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground font-semibold">
                    Message (optionnel)
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-navy-deep/50 border-cyan-electric/30 focus:border-cyan-electric min-h-28"
                    placeholder="Parlez-nous de vos besoins, de votre secteur d'activité..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("datetime")}
                    className="flex-1 border-cyan-electric/30 hover:bg-cyan-electric/10 h-14 text-base"
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 btn-hero h-14 text-lg"
                  >
                    Confirmer la démo
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {step === "confirmation" && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="glass-card p-12 text-center space-y-8 border-cyan-electric/30">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-electric/30 to-cyan-electric/10 flex items-center justify-center animate-scale-in">
                  <Check className="w-10 h-10 text-cyan-electric" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold gradient-text">C'est confirmé !</h3>
                  <p className="text-base text-muted-foreground">
                    Votre démo est réservée pour le
                  </p>
                  <div className="p-5 rounded-lg bg-cyan-electric/10 border border-cyan-electric/30 inline-block">
                    <p className="text-xl font-bold text-foreground">
                      {selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                    </p>
                    <p className="text-lg text-cyan-electric font-semibold mt-1">
                      à {selectedTime}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground max-w-md">
                  <p className="flex items-start gap-2 text-left">
                    <Check className="w-4 h-4 text-cyan-electric mt-0.5 flex-shrink-0" />
                    <span>Email de confirmation envoyé à <strong className="text-foreground">{formData.email}</strong></span>
                  </p>
                  <p className="flex items-start gap-2 text-left">
                    <Check className="w-4 h-4 text-cyan-electric mt-0.5 flex-shrink-0" />
                    <span>Lien Google Meet inclus dans l'email</span>
                  </p>
                  <p className="flex items-start gap-2 text-left">
                    <Check className="w-4 h-4 text-cyan-electric mt-0.5 flex-shrink-0" />
                    <span>Rappel automatique 24h avant le rendez-vous</span>
                  </p>
                </div>

                <Button
                  onClick={handleReset}
                  className="btn-hero mt-4 h-12 text-base px-8"
                >
                  Parfait, merci !
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
