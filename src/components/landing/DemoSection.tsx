import { useState } from "react";
import { MapPin, Filter, List, Search, Building2, Target, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

export const DemoSection = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'filter' | 'list'>('map');

  return (
    <section id="demo" className="container mx-auto px-6 py-32">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
          <Target className="w-4 h-4 text-accent" />
          <span className="text-sm text-accent font-medium">Démo Interactive</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold">
          Découvrez LeadMagnet en action
        </h2>
        <p className="text-xl text-muted-foreground">
          Une plateforme complète pour transformer votre prospection commerciale
        </p>
      </div>

      {/* Interactive Demo Tabs */}
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-4 mb-8 justify-center flex-wrap">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'map' 
                ? 'bg-accent text-primary shadow-lg shadow-accent/50' 
                : 'glass-card hover:border-accent/50'
            }`}
          >
            <MapPin className="w-5 h-5 inline mr-2" />
            Cartographie
          </button>
          <button
            onClick={() => setActiveTab('filter')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'filter' 
                ? 'bg-accent text-primary shadow-lg shadow-accent/50' 
                : 'glass-card hover:border-accent/50'
            }`}
          >
            <Filter className="w-5 h-5 inline mr-2" />
            Filtres Intelligents
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'list' 
                ? 'bg-accent text-primary shadow-lg shadow-accent/50' 
                : 'glass-card hover:border-accent/50'
            }`}
          >
            <List className="w-5 h-5 inline mr-2" />
            Vue Liste
          </button>
        </div>

        {/* Demo Content */}
        <Card className="glass-card p-8 min-h-[500px] relative overflow-hidden">
          {activeTab === 'map' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Cartographie Interactive</h3>
                  <p className="text-muted-foreground">Visualisez toutes vos leads sur une carte en temps réel</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="glass-card p-6 border-l-4 border-accent">
                    <h4 className="font-semibold text-lg mb-2">📍 Géolocalisation précise</h4>
                    <p className="text-muted-foreground text-sm">
                      Chaque entreprise est positionnée avec précision grâce aux données GPS officielles
                    </p>
                  </div>
                  <div className="glass-card p-6 border-l-4 border-accent">
                    <h4 className="font-semibold text-lg mb-2">🔍 Zoom adaptatif</h4>
                    <p className="text-muted-foreground text-sm">
                      Navigation fluide du niveau national jusqu'à l'adresse exacte
                    </p>
                  </div>
                  <div className="glass-card p-6 border-l-4 border-accent">
                    <h4 className="font-semibold text-lg mb-2">💼 Informations détaillées</h4>
                    <p className="text-muted-foreground text-sm">
                      Cliquez sur un marqueur pour accéder à toutes les données de l'entreprise
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-xl"></div>
                  <div className="relative glass-card p-6 h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <MapPin className="w-20 h-20 text-accent mx-auto animate-bounce" />
                      <p className="text-lg font-semibold">Carte interactive disponible</p>
                      <p className="text-sm text-muted-foreground">dans le dashboard complet</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'filter' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Filter className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Filtres Intelligents</h3>
                  <p className="text-muted-foreground">Affinez votre recherche avec une précision chirurgicale</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-card p-6 space-y-3 hover:border-accent/50 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Search className="w-5 h-5 text-accent" />
                  </div>
                  <h4 className="font-semibold">Par Département</h4>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez un ou plusieurs départements français (01 à 95)
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 bg-accent/20 rounded-full text-xs">01 - Ain</span>
                    <span className="px-3 py-1 bg-accent/20 rounded-full text-xs">75 - Paris</span>
                    <span className="px-3 py-1 bg-accent/20 rounded-full text-xs">13 - B-d-R</span>
                  </div>
                </div>

                <div className="glass-card p-6 space-y-3 hover:border-accent/50 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-accent" />
                  </div>
                  <h4 className="font-semibold">Par Secteur</h4>
                  <p className="text-sm text-muted-foreground">
                    Filtrez par catégories d'activité professionnelle
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 bg-accent/20 rounded-full text-xs">🏗️ BTP</span>
                    <span className="px-3 py-1 bg-accent/20 rounded-full text-xs">🍽️ Restauration</span>
                    <span className="px-3 py-1 bg-accent/20 rounded-full text-xs">💻 Tech</span>
                  </div>
                </div>

                <div className="glass-card p-6 space-y-3 hover:border-accent/50 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-accent" />
                  </div>
                  <h4 className="font-semibold">Par Date</h4>
                  <p className="text-sm text-muted-foreground">
                    Ciblez les entreprises récemment créées
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 bg-accent/20 rounded-full text-xs">Cette semaine</span>
                    <span className="px-3 py-1 bg-accent/20 rounded-full text-xs">Ce mois</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 bg-gradient-to-r from-accent/10 to-transparent border-accent/30 mt-8">
                <div className="flex items-start gap-4">
                  <Zap className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Combinaison de filtres</h4>
                    <p className="text-muted-foreground">
                      Combinez plusieurs critères pour des résultats ultra-précis. Par exemple : 
                      <span className="text-accent font-medium"> "Restaurants créés ce mois-ci dans le 75"</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <List className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Vue Liste Détaillée</h3>
                  <p className="text-muted-foreground">Accédez à toutes les informations en un coup d'œil</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { name: "TACOS RETZ", siret: "991546672", address: "22 place du Docteur Mouflier, 2600 Villers-Cotterêts", activity: "Vente rapide d'aliments et boissons", capital: "1 000 €" },
                  { name: "DAMAX FAMILY", siret: "788845675", address: "33 Rue Scaliéro, 6300 Nice", activity: "Loueur en meublé, acquisition et aménagement", capital: "100 000 €" },
                  { name: "CRYSTAL DEVELOPMENT", siret: "905216560", address: "2587 Route de Palombaggia, 20137 Porto-Vecchio", activity: "Gestion immobilière locative", capital: "10 000 €" },
                ].map((company, index) => (
                  <div key={index} className="glass-card p-6 hover:border-accent/50 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-lg group-hover:text-accent transition-colors">{company.name}</h4>
                          <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">Nouveau</span>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-accent" />
                          {company.address}
                        </p>
                        <p className="text-sm">{company.activity}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">SIRET</p>
                        <p className="font-mono text-sm">{company.siret}</p>
                        <p className="text-sm font-semibold text-accent">{company.capital}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-card p-6 bg-gradient-to-r from-accent/10 to-transparent border-accent/30">
                <p className="text-center text-muted-foreground">
                  <span className="font-semibold text-accent">636 entreprises</span> trouvées avec ces critères
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};
