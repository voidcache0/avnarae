import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, MapPin, Search, SlidersHorizontal } from "lucide-react";

const Practitioners = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const practitioners = [
    {
      id: 1,
      name: "Sarah Johnson",
      type: "Spiritual Counselor",
      category: "Traditional Healing",
      rating: 4.9,
      reviews: 127,
      location: "Cape Town",
      price: 450,
      image: "SJ",
      specialties: ["Anxiety", "Life Purpose", "Relationships"],
    },
    {
      id: 2,
      name: "Michael Chen",
      type: "Energy Healer",
      category: "Reiki & Energy Work",
      rating: 4.8,
      reviews: 93,
      location: "Johannesburg",
      price: 380,
      image: "MC",
      specialties: ["Stress Relief", "Chakra Balance", "Pain Management"],
    },
    {
      id: 3,
      name: "Amara Nkosi",
      type: "Sangoma",
      category: "Ancestral Guidance",
      rating: 5.0,
      reviews: 156,
      location: "Durban",
      price: 500,
      image: "AN",
      specialties: ["Ancestral Connection", "Spiritual Cleansing", "Dream Interpretation"],
    },
    {
      id: 4,
      name: "David Williams",
      type: "Meditation Guide",
      category: "Spiritual Counseling",
      rating: 4.7,
      reviews: 84,
      location: "Pretoria",
      price: 350,
      image: "DW",
      specialties: ["Mindfulness", "Stress Management", "Inner Peace"],
    },
    {
      id: 5,
      name: "Lisa Van Der Merwe",
      type: "Tarot Reader",
      category: "Divination",
      rating: 4.9,
      reviews: 112,
      location: "Cape Town",
      price: 300,
      image: "LV",
      specialties: ["Future Insights", "Life Decisions", "Career Guidance"],
    },
    {
      id: 6,
      name: "Thabo Mabaso",
      type: "Traditional Healer",
      category: "Traditional Healing",
      rating: 4.8,
      reviews: 98,
      location: "Johannesburg",
      price: 420,
      image: "TM",
      specialties: ["Herbal Medicine", "Spiritual Protection", "Physical Wellness"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="border-b bg-gradient-hero py-12">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-4xl font-bold">Find Your Spiritual Guide</h1>
          <p className="text-lg text-muted-foreground">
            Browse our verified practitioners and book a session that resonates with you
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="border-b bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, specialty, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="traditional">Traditional Healing</SelectItem>
                  <SelectItem value="energy">Reiki & Energy Work</SelectItem>
                  <SelectItem value="counseling">Spiritual Counseling</SelectItem>
                  <SelectItem value="ancestral">Ancestral Guidance</SelectItem>
                  <SelectItem value="divination">Divination</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="cape-town">Cape Town</SelectItem>
                  <SelectItem value="johannesburg">Johannesburg</SelectItem>
                  <SelectItem value="durban">Durban</SelectItem>
                  <SelectItem value="pretoria">Pretoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {practitioners.length} practitioners
            </p>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {practitioners.map((practitioner) => (
              <Card
                key={practitioner.id}
                className="overflow-hidden transition-all hover:shadow-soft"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-xl font-bold text-primary-foreground">
                      {practitioner.image}
                    </div>
                    <Badge variant="secondary">{practitioner.category}</Badge>
                  </div>

                  <h3 className="mb-1 text-xl font-semibold">{practitioner.name}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">{practitioner.type}</p>

                  <div className="mb-4 flex flex-wrap gap-1">
                    {practitioner.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <div className="mb-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-medium">{practitioner.rating}</span>
                      <span className="text-muted-foreground">({practitioner.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{practitioner.location}</span>
                    </div>
                  </div>

                  <div className="mb-4 flex items-baseline gap-1">
                    <span className="text-2xl font-bold">R{practitioner.price}</span>
                    <span className="text-sm text-muted-foreground">/session</span>
                  </div>

                  <Button className="w-full" asChild>
                    <Link to={`/practitioners/${practitioner.id}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Practitioners;
