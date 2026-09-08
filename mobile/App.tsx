import { StatusBar } from "expo-status-bar"
import { useMemo, useState } from "react"
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"

const API_URL = "https://teranga-automobile.com/api/contact"
const WHATSAPP_NUMBER = "221787164232"

type Vehicle = {
  id: string
  name: string
  category: string
  details: string
  price: string
  offer: "location" | "vente"
}

const vehicles: Vehicle[] = [
  { id: "land-cruiser", name: "Toyota Land Cruiser", category: "SUV 4x4", details: "Automatique · 7 places · Diesel", price: "75 000 FCFA / jour", offer: "location" },
  { id: "classe-e", name: "Mercedes-Benz Classe E", category: "Berline", details: "Automatique · 5 places · Essence", price: "28 500 000 FCFA", offer: "vente" },
  { id: "tucson", name: "Hyundai Tucson", category: "SUV", details: "Automatique · 5 places · Essence", price: "45 000 FCFA / jour", offer: "location" },
  { id: "corolla", name: "Toyota Corolla", category: "Berline", details: "Manuelle · 5 places · Essence", price: "12 900 000 FCFA", offer: "vente" },
  { id: "navara", name: "Nissan Navara", category: "Pickup", details: "Manuelle · 5 places · Diesel", price: "55 000 FCFA / jour", offer: "location" },
  { id: "picanto", name: "Kia Picanto", category: "Citadine", details: "Manuelle · 4 places · Essence", price: "22 000 FCFA / jour", offer: "location" },
]

const categories = ["Tous", "Location", "Vente"]

function openWhatsApp(message: string) {
  Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`)
}

export default function App() {
  const [category, setCategory] = useState("Tous")
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const visibleVehicles = useMemo(
    () => vehicles.filter((vehicle) => category === "Tous" || vehicle.offer === category.toLowerCase()),
    [category],
  )

  const sendRequest = async () => {
    if (!name.trim() || !phone.trim() || !message.trim()) {
      Alert.alert("Champs requis", "Renseigne ton nom, ton téléphone et ton message.")
      return
    }

    setIsSending(true)
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          subject: selectedVehicle ? `${selectedVehicle.offer === "location" ? "Location" : "Achat"} : ${selectedVehicle.name}` : "Demande mobile",
          message,
        }),
      })

      if (!response.ok) throw new Error("La demande n'a pas pu être envoyée.")
      Alert.alert("Demande envoyée", "Notre équipe Teranga vous répondra rapidement.")
      setName("")
      setPhone("")
      setMessage("")
    } catch (error) {
      Alert.alert("Envoi impossible", error instanceof Error ? error.message : "Réessaie dans quelques instants.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>TERANGA AUTOMOBILE</Text>
          <Text style={styles.title}>Votre route commence ici.</Text>
          <Text style={styles.heroText}>Location et vente de véhicules fiables à Dakar, avec la teranga sénégalaise.</Text>
          <Pressable style={styles.whatsappButton} onPress={() => openWhatsApp("Bonjour Teranga Automobile, je souhaite obtenir des informations.")}>
            <Text style={styles.whatsappText}>Écrire sur WhatsApp</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>NOTRE PARC</Text>
            <Text style={styles.sectionTitle}>Choisissez votre véhicule</Text>
          </View>
        </View>

        <View style={styles.filters}>
          {categories.map((item) => (
            <Pressable key={item} onPress={() => setCategory(item)} style={[styles.filter, category === item && styles.activeFilter]}>
              <Text style={[styles.filterText, category === item && styles.activeFilterText]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.vehicleGrid}>
          {visibleVehicles.map((vehicle) => (
            <Pressable key={vehicle.id} style={styles.vehicleCard} onPress={() => setSelectedVehicle(vehicle)}>
              <View style={[styles.vehicleBadge, vehicle.offer === "vente" && styles.saleBadge]}>
                <Text style={styles.badgeText}>{vehicle.offer === "location" ? "LOCATION" : "VENTE"}</Text>
              </View>
              <Text style={styles.vehicleCategory}>{vehicle.category}</Text>
              <Text style={styles.vehicleName}>{vehicle.name}</Text>
              <Text style={styles.vehicleDetails}>{vehicle.details}</Text>
              <Text style={styles.price}>{vehicle.price}</Text>
              <Text style={styles.viewDetails}>Voir les détails  ›</Text>
            </Pressable>
          ))}
        </View>

        {selectedVehicle ? (
          <View style={styles.requestPanel}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>VOTRE DEMANDE</Text>
                <Text style={styles.panelTitle}>{selectedVehicle.name}</Text>
              </View>
              <Pressable onPress={() => setSelectedVehicle(null)}><Text style={styles.close}>Fermer</Text></Pressable>
            </View>
            <TextInput placeholder="Nom complet" value={name} onChangeText={setName} style={styles.input} placeholderTextColor="#8a918b" />
            <TextInput placeholder="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} placeholderTextColor="#8a918b" />
            <TextInput placeholder="Votre message" value={message} onChangeText={setMessage} multiline style={[styles.input, styles.messageInput]} placeholderTextColor="#8a918b" />
            <Pressable style={styles.submitButton} onPress={sendRequest} disabled={isSending}>
              <Text style={styles.submitText}>{isSending ? "Envoi..." : "Envoyer ma demande"}</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => openWhatsApp(`Bonjour Teranga Automobile, je suis intéressé par ${selectedVehicle.name}.`)}>
              <Text style={styles.secondaryText}>Continuer sur WhatsApp</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.footerInfo}>
          <Text style={styles.footerTitle}>Disponible tous les jours</Text>
          <Text style={styles.footerText}>Lun–Dim · 8h – 24h · +221 78 716 42 32</Text>
          <Text style={styles.footerText}>contact@teranga-automobile.com</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f6f0",
  },
  content: {
    paddingBottom: 36,
  },
  hero: {
    padding: 28,
    paddingTop: 68,
    backgroundColor: "#123d2c",
  },
  eyebrow: {
    color: "#d7aa4b",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  title: {
    color: "#fffdf5",
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "800",
    marginTop: 18,
  },
  heroText: {
    color: "#d9e3d9",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
  },
  whatsappButton: {
    alignSelf: "flex-start",
    backgroundColor: "#25d366",
    borderRadius: 8,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  whatsappText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  sectionEyebrow: {
    color: "#ae7d28",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  sectionTitle: {
    color: "#173629",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 6,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  filter: {
    borderColor: "#d9ded5",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  activeFilter: {
    backgroundColor: "#174633",
    borderColor: "#174633",
  },
  filterText: {
    color: "#567062",
    fontSize: 13,
    fontWeight: "700",
  },
  activeFilterText: {
    color: "#fff",
  },
  vehicleGrid: {
    gap: 12,
    paddingHorizontal: 20,
  },
  vehicleCard: {
    backgroundColor: "#fff",
    borderColor: "#e3e5dc",
    borderRadius: 12,
    borderWidth: 1,
    padding: 17,
  },
  vehicleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#e9f2e9",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  saleBadge: {
    backgroundColor: "#f6edda",
  },
  badgeText: {
    color: "#397052",
    fontSize: 10,
    fontWeight: "800",
  },
  vehicleCategory: {
    color: "#a17b35",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 18,
  },
  vehicleName: {
    color: "#173629",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },
  vehicleDetails: {
    color: "#68756c",
    fontSize: 13,
    marginTop: 7,
  },
  price: {
    color: "#173629",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 16,
  },
  viewDetails: {
    color: "#a17b35",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 14,
  },
  requestPanel: {
    backgroundColor: "#fff",
    borderColor: "#dce2d9",
    borderRadius: 12,
    borderWidth: 1,
    margin: 20,
    padding: 18,
  },
  panelHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  panelTitle: {
    color: "#173629",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 5,
  },
  close: {
    color: "#a17b35",
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#f7f8f3",
    borderColor: "#dce2d9",
    borderRadius: 8,
    borderWidth: 1,
    color: "#173629",
    fontSize: 15,
    marginTop: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  messageInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#174633",
    borderRadius: 8,
    marginTop: 14,
    paddingVertical: 14,
  },
  submitText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#25d366",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    paddingVertical: 13,
  },
  secondaryText: {
    color: "#168b42",
    fontSize: 14,
    fontWeight: "800",
  },
  footerInfo: {
    borderTopColor: "#dfe4dc",
    borderTopWidth: 1,
    marginHorizontal: 20,
    marginTop: 32,
    paddingTop: 20,
  },
  footerTitle: {
    color: "#173629",
    fontSize: 16,
    fontWeight: "800",
  },
  footerText: {
    color: "#68756c",
    fontSize: 13,
    marginTop: 7,
  },
})
