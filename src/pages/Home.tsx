import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Calendar, Shield, Heart, Users } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";

const Home = () => {
  const featuredPractitioners = [
    {
      id: 1,
      name: "Sarah Johnson",
      type: "Spiritual Counselor",
      category: "Traditional Healing",
      rating: 4.9,
      reviews: 127,
      location: "Cape Town",
      image: "SJ",
    },
    {
      id: 2,
      name: "Michael Chen",
      type: "Energy Healer",
      category: "Reiki & Energy Work",
      rating: 4.8,
      reviews: 93,
      location: "Johannesburg",
      image: "MC",
    },
    {
      id: 3,
      name: "Amara Nkosi",
      type: "Sangoma",
      category: "Ancestral Guidance",
      rating: 5.0,
      reviews: 156,
      location: "Durban",
      image: "AN",
    },
  ];

  const categories = [
    { name: "Traditional Healing", icon: "🌿", count: 45 },
    { name: "Energy Work", icon: "✨", count: 38 },
    { name: "Spiritual Counseling", icon: "🙏", count: 52 },
    { name: "Ancestral Guidance", icon: "🕯️", count: 29 },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={heroBackground} 
            alt="Mystical spiritual background" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-background/60" />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20">
            Connect with Spiritual Guidance
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Find Your Path to
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}
              Inner Peace
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Connect with trusted spiritual practitioners, traditional healers, and energy workers
            who can guide you on your journey to wellness and balance.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="shadow-soft">
              <Link to="/practitioners">Find a Practitioner</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/signup">Join as Practitioner</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="mb-2 text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Verified Practitioners</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-primary">10k+</div>
              <div className="text-sm text-muted-foreground">Sessions Completed</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-primary">4.8★</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Explore by Category</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link key={category.name} to="/practitioners">
                <Card className="group cursor-pointer transition-all hover:shadow-soft">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4 text-5xl transition-transform group-hover:scale-110">
                      {category.icon}
                    </div>
                    <h3 className="mb-2 font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} practitioners</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Practitioners */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Featured Practitioners</h2>
            <p className="text-muted-foreground">
              Meet some of our highly-rated spiritual guides
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {featuredPractitioners.map((practitioner) => (
              <Card key={practitioner.id} className="overflow-hidden transition-all hover:shadow-soft">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-xl font-bold text-primary-foreground">
                      {practitioner.image}
                    </div>
                    <Badge variant="secondary">{practitioner.category}</Badge>
                  </div>

                  <h3 className="mb-1 text-xl font-semibold">{practitioner.name}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">{practitioner.type}</p>

                  <div className="mb-4 flex items-center gap-4 text-sm">
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

                  <Button className="w-full" asChild>
                    <Link to={`/practitioners/${practitioner.id}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/practitioners">View All Practitioners</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Avenrae */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Choose Avenrae</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Verified Practitioners</h3>
              <p className="text-muted-foreground">
                All practitioners are carefully vetted and verified for authenticity and professionalism
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Easy Booking</h3>
              <p className="text-muted-foreground">
                Book sessions instantly with real-time availability and secure payment processing
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Trusted Community</h3>
              <p className="text-muted-foreground">
                Join thousands who have found guidance and healing through our platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-spiritual py-16">
        <div className="container mx-auto px-4 text-center">
          <Users className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h2 className="mb-4 text-3xl font-bold">Ready to Begin Your Journey?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Whether you're seeking guidance, healing, or spiritual growth, our community of practitioners is here to support you.
          </p>
          <Button size="lg" asChild>
            <Link to="/signup">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
