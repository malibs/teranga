export type Vehicle = {
  id: string
  name: string
  brand: string
  category: string
  image: string
  transmission: string
  seats: number
  fuel: string
  year: number
  offer: "location" | "vente"
  price: string
  priceUnit: string
  featured?: boolean
}

export const vehicles: Vehicle[] = [
  {
    id: "toyota-land-cruiser",
    name: "Toyota Land Cruiser",
    brand: "Toyota",
    category: "SUV 4x4",
    image: "/cars/toyota-landcruiser.png",
    transmission: "Automatique",
    seats: 7,
    fuel: "Diesel",
    year: 2023,
    offer: "location",
    price: "75 000",
    priceUnit: "FCFA / jour",
    featured: true,
  },
  {
    id: "mercedes-classe-e",
    name: "Mercedes-Benz Classe E",
    brand: "Mercedes-Benz",
    category: "Berline",
    image: "/cars/mercedes-sedan.png",
    transmission: "Automatique",
    seats: 5,
    fuel: "Essence",
    year: 2022,
    offer: "vente",
    price: "28 500 000",
    priceUnit: "FCFA",
    featured: true,
  },
  {
    id: "hyundai-tucson",
    name: "Hyundai Tucson",
    brand: "Hyundai",
    category: "SUV",
    image: "/cars/hyundai-tucson.png",
    transmission: "Automatique",
    seats: 5,
    fuel: "Essence",
    year: 2023,
    offer: "location",
    price: "45 000",
    priceUnit: "FCFA / jour",
    featured: true,
  },
  {
    id: "toyota-corolla",
    name: "Toyota Corolla",
    brand: "Toyota",
    category: "Berline",
    image: "/cars/toyota-corolla.png",
    transmission: "Manuelle",
    seats: 5,
    fuel: "Essence",
    year: 2021,
    offer: "vente",
    price: "12 900 000",
    priceUnit: "FCFA",
  },
  {
    id: "nissan-navara",
    name: "Nissan Navara",
    brand: "Nissan",
    category: "Pickup",
    image: "/cars/nissan-pickup.png",
    transmission: "Manuelle",
    seats: 5,
    fuel: "Diesel",
    year: 2022,
    offer: "location",
    price: "55 000",
    priceUnit: "FCFA / jour",
  },
  {
    id: "kia-picanto",
    name: "Kia Picanto",
    brand: "Kia",
    category: "Citadine",
    image: "/cars/kia-picanto.png",
    transmission: "Manuelle",
    seats: 4,
    fuel: "Essence",
    year: 2023,
    offer: "location",
    price: "22 000",
    priceUnit: "FCFA / jour",
  },
]
