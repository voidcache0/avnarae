import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  Award,
  Heart,
  Share2,
  ChevronLeft,
} from "lucide-react";

const PractitionerProfile = () => {
  const { id } = useParams();

  // Mock data - will be fetched from API
  const practitioner = {
    id: 1,
    name: "Sarah Johnson",
    type: "Spiritual Counselor",
    category: "Traditional Healing",
    rating: 4.9,
    reviews: 127,
    location: "Cape Town, Western Cape",
    price: 450,
    image: "SJ",
    specialties: ["Anxiety", "Life Purpose", "Relationships", "Spiritual Growth"],
    languages: ["English", "Afrikaans"],
    experience: "12 years",
    verified: true,
    bio: "With over 12 years of experience in spiritual counseling and traditional healing practices, I've dedicated my life to helping others find their path to inner peace and balance. My approach combines ancient wisdom with modern understanding, creating a safe space for healing and transformation.",
    qualifications: [
      "Certified Spiritual Counselor (2011)",
      "Traditional Healing Certification",
      "Holistic Wellness Practitioner",
      "Energy Healing Level III",
    ],
    availability: "Mon-Fri: 9am-6pm, Sat: 10am-4pm",
  };

  const reviews = [
    {
      id: 1,
      author: "Jane D.",
      rating: 5,
      date: "2 weeks ago",
      text: "Sarah has been incredibly helpful in my spiritual journey. Her insights are profound and her guidance has brought clarity to many aspects of my life.",
    },
    {
      id: 2,
      author: "Michael P.",
      rating: 5,
      date: "1 month ago",
      text: "Professional, compassionate, and genuinely gifted. I've seen remarkable changes since our sessions began.",
    },
    {
      id: 3,
      author: "Lisa M.",
      rating: 4,
      date: "2 months ago",
      text: "Very knowledgeable and patient. The sessions have helped me understand myself better and find peace.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link to="/practitioners">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Practitioners
            </Link>
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <section className="border-b bg-gradient-hero py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-6 flex items-start gap-6">
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-3xl font-bold text-primary-foreground">
                  {practitioner.image}
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{practitioner.name}</h1>
                    {practitioner.verified && (
                      <Badge className="bg-green-500">Verified</Badge>
                    )}
                  </div>
                  <p className="mb-3 text-lg text-muted-foreground">{practitioner.type}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-medium">{practitioner.rating}</span>
                      <span className="text-muted-foreground">
                        ({practitioner.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{practitioner.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Award className="h-4 w-4" />
                      <span>{practitioner.experience} experience</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {practitioner.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-3">
                <Button size="icon" variant="outline">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 shadow-soft">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">R{practitioner.price}</span>
                    <span className="text-muted-foreground">/session</span>
                  </div>

                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>60 minutes per session</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{practitioner.availability}</span>
                    </div>
                  </div>

                  <Button className="mb-3 w-full" size="lg">
                    Book Session
                  </Button>
                  <Button className="w-full" variant="outline">
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="mb-6 w-full justify-start">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews ({practitioner.reviews})</TabsTrigger>
                  <TabsTrigger value="availability">Availability</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-xl font-semibold">About Me</h2>
                      <p className="text-muted-foreground">{practitioner.bio}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-xl font-semibold">Qualifications</h2>
                      <ul className="space-y-2">
                        {practitioner.qualifications.map((qual, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Award className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                            <span className="text-muted-foreground">{qual}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-xl font-semibold">Languages</h2>
                      <div className="flex gap-2">
                        {practitioner.languages.map((lang) => (
                          <Badge key={lang} variant="outline">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{review.author[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{review.author}</p>
                              <p className="text-sm text-muted-foreground">{review.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-primary text-primary"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.text}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="availability">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-xl font-semibold">Schedule</h2>
                      <p className="mb-6 text-muted-foreground">
                        Select a date and time to book your session
                      </p>
                      <div className="rounded-lg border p-8 text-center">
                        <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Calendar integration coming soon
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold">Contact Information</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="mb-1 text-muted-foreground">Response Time</p>
                      <p className="font-medium">Within 2 hours</p>
                    </div>
                    <div>
                      <p className="mb-1 text-muted-foreground">Session Format</p>
                      <p className="font-medium">In-person & Online</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-spiritual">
                <CardContent className="p-6">
                  <h3 className="mb-2 font-semibold">New Client Special</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Get 20% off your first session
                  </p>
                  <Button className="w-full" variant="secondary">
                    Claim Offer
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PractitionerProfile;
