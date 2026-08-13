import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type SortOption = 'nearest' | 'price-low' | 'price-high'
type Listing = (typeof listings)[number] & { calculatedDistance?: number | null }

// Fixed reference point shown as the "you are here" marker (central Metro Manila)
const USER_LOCATION: [number, number] = [14.5547, 121.0244]

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const listings = [
  {
    id: 1,
    title: 'BGC Corner Unit',
    address: '32nd St, Bonifacio Global City, Taguig',
    city: 'Taguig',
    price: 45000,
    beds: 2,
    baths: 2,
    sqft: 95,
    distance: '0.4 km',
    tag: 'NEW',
    lat: 14.5507,
    lng: 121.0509,
    amenities: ['WiFi', 'Parking', 'Gym', 'Pool', 'Security', 'CCTV'],
    available: 'Aug 1, 2026',
    propertyType: 'Apartment',
    owner: 'Maria Santos',
    description: "Modern corner unit in the heart of BGC with panoramic city views. Fully furnished with premium appliances, floor-to-ceiling glass windows, and a private balcony overlooking the financial district.",
    images: [
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=900&fit=crop&auto=format',
    ],
  },
  {
    id: 2,
    title: 'Makati Studio Pad',
    address: 'Legazpi Village, Makati City',
    city: 'Makati',
    price: 22000,
    beds: 0,
    baths: 1,
    sqft: 38,
    distance: '1.2 km',
    tag: null,
    lat: 14.5578,
    lng: 121.0195,
    amenities: ['WiFi', 'Laundry', 'Security', 'CCTV'],
    available: 'Jul 31, 2026',
    propertyType: 'Studio',
    owner: 'Juan Dela Cruz',
    description: 'Cozy studio in the quiet enclave of Legazpi Village, steps from Ayala Triangle Gardens and Greenbelt Mall. Ideal for young professionals. Includes weekly housekeeping.',
    images: [
      'https://images.unsplash.com/photo-1564703048291-bcf7f001d83d?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=900&fit=crop&auto=format',
    ],
  },
  {
    id: 3,
    title: 'Ortigas Townhouse',
    address: 'Oranbo, Pasig City',
    city: 'Pasig',
    price: 38000,
    beds: 3,
    baths: 2,
    sqft: 140,
    distance: '2.1 km',
    tag: 'HOT',
    lat: 14.5765,
    lng: 121.0662,
    amenities: ['WiFi', 'Garage', 'Garden', 'Security', 'Pets OK'],
    available: 'Sep 1, 2026',
    propertyType: 'House',
    owner: 'Roberto Reyes',
    description: 'Spacious three-bedroom townhouse with a landscaped garden and private garage. Newly renovated kitchen, narra hardwood floors, and a rooftop deck perfect for entertaining.',
    images: [
      'https://images.unsplash.com/photo-1628744448839-a475cc0e90c3?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1617104551722-3b2d51366400?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200&h=900&fit=crop&auto=format',
    ],
  },
  {
    id: 4,
    title: 'QC Family Home',
    address: 'New Manila, Quezon City',
    city: 'Quezon City',
    price: 55000,
    beds: 4,
    baths: 3,
    sqft: 210,
    distance: '3.5 km',
    tag: null,
    lat: 14.6092,
    lng: 121.0409,
    amenities: ['WiFi', 'Garage', 'Garden', 'Pool', 'Helper Room', 'Pets OK'],
    available: 'Aug 15, 2026',
    propertyType: 'House',
    owner: 'Carmela Garcia',
    description: 'Classic New Manila home on a quiet tree-lined street. Four generous bedrooms, a swimming pool in the lush garden, and a separate helper quarters. Close to Greenhills Shopping Center.',
    images: [
      'https://images.unsplash.com/photo-1784091473955-f66695d19b58?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&h=900&fit=crop&auto=format',
    ],
  },
  {
    id: 5,
    title: 'Alabang Enclave',
    address: 'Alabang Hills Village, Muntinlupa',
    city: 'Muntinlupa',
    price: 68000,
    beds: 4,
    baths: 4,
    sqft: 280,
    distance: '5.0 km',
    tag: 'NEW',
    lat: 14.4085,
    lng: 121.0233,
    amenities: ['WiFi', 'Garage', 'Pool', 'Gym', 'Clubhouse', 'Security'],
    available: 'Aug 1, 2026',
    propertyType: 'House',
    owner: 'Antonio Mendoza',
    description: 'Prestigious property inside a gated village in Alabang Hills. Expansive living areas, a private pool with cabana, and a home gym. 24/7 village security and roving guards.',
    images: [
      'https://images.unsplash.com/photo-1759860002233-ef26089ed4ab?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&h=900&fit=crop&auto=format',
    ],
  },
  {
    id: 6,
    title: 'Mandaluyong Flat',
    address: 'Wack-Wack, Mandaluyong City',
    city: 'Mandaluyong',
    price: 28000,
    beds: 2,
    baths: 1,
    sqft: 72,
    distance: '1.8 km',
    tag: null,
    lat: 14.5825,
    lng: 121.0407,
    amenities: ['WiFi', 'Laundry', 'Parking', 'Security'],
    available: 'Sep 15, 2026',
    propertyType: 'Apartment',
    owner: 'Ana Tolentino',
    description: 'Well-maintained two-bedroom flat beside the scenic Wack-Wack Golf Course. Bright and airy interiors, updated bathroom, and a generous balcony. Walking distance to Shangri-La Plaza.',
    images: [
      'https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&h=900&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=900&fit=crop&auto=format',
    ],
  },
]

const priceFilters = ['Any', '<₱25K', '₱25K–₱50K', '₱50K+']
const typeFilters = ['All', 'House', 'Apartment', 'Boarding House', 'Dormitory', 'Room for Rent', 'Bedspace', 'Studio']
const sortOptions = [
  { value: 'nearest', label: 'Nearest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
]

// ─── Gallery hook ───────────────────────────────────────────────────────────
// Shared carousel logic (index state + swipe handling) reused by the card
// thumbnail, the detail hero, and the fullscreen lightbox.

function useGallery(length: number, initial = 0) {
  const [index, setIndex] = useState(initial)
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef(0)

  const next = () => setIndex((i) => (i + 1) % length)
  const prev = () => setIndex((i) => (i - 1 + length) % length)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchDeltaX.current = 0
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current
  }
  const onTouchEnd = () => {
    if (touchDeltaX.current > 40) prev()
    else if (touchDeltaX.current < -40) next()
    touchStartX.current = null
    touchDeltaX.current = 0
  }

  return { index, setIndex, next, prev, onTouchStart, onTouchMove, onTouchEnd }
}

// ─── Map ──────────────────────────────────────────────────────────────────────

// Builds a custom Leaflet divIcon that mirrors the app's price-pill pin design
function createPriceIcon(item: Listing, isSelected: boolean) {
  const bg = isSelected ? '#f97316' : '#21273a'
  const color = isSelected ? '#fff' : '#f0f2f8'
  const border = isSelected ? '2px solid #fb923c' : '1.5px solid #3a4560'
  const scale = isSelected ? 1.12 : 1
  const label = `₱${(item.price / 1000).toFixed(0)}K`
  return L.divIcon({
    className: 'nearrent-price-marker',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:scale(${scale});transform-origin:bottom center;cursor:pointer;">
        <div style="display:flex;align-items:center;padding:4px 10px;border-radius:9999px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 4px 10px rgba(0,0,0,0.35);background:${bg};color:${color};border:${border};font-family:'Nunito',sans-serif;">
          ${label}
        </div>
        <div style="width:8px;height:8px;margin-top:-3px;transform:rotate(45deg);background:${bg};border-right:${border};border-bottom:${border};"></div>
      </div>
    `,
    iconSize: [70, 34],
    iconAnchor: [35, 34],
  })
}

// The pulsing "you are here" marker
function createUserIcon() {
  return L.divIcon({
    className: 'nearrent-user-marker',
    html: `
      <div style="position:relative;width:24px;height:24px;">
        <div class="animate-ping" style="position:absolute;inset:0;border-radius:9999px;background:#3b82f6;opacity:0.4;"></div>
        <div style="position:absolute;inset:0;border-radius:9999px;background:#3b82f6;border:3px solid white;box-shadow:0 4px 12px rgba(59,130,246,0.5);display:flex;align-items:center;justify-content:center;">
          <div style="width:8px;height:8px;border-radius:9999px;background:white;"></div>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

// Smoothly pans/zooms the map to the selected listing
function FlyToSelected({ item }: { item: Listing | null }) {
  const map = useMap()
  useEffect(() => {
    if (item) map.flyTo([item.lat, item.lng], 15, { duration: 0.6 })
  }, [item, map])
  return null
}

// Smoothly pans/zooms the map to the user's location when it's obtained or when triggered
function FlyToUserLocation({ userLocation, trigger }: { userLocation: [number, number] | null; trigger: number }) {
  const map = useMap()
  
  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 14, { duration: 1.0 })
    }
  }, [userLocation, map])
  
  useEffect(() => {
    if (userLocation && trigger > 0) {
      map.flyTo(userLocation, 14, { duration: 0.8 })
    }
  }, [trigger, userLocation, map])
  
  return null
}

// Fixes Leaflet's initial-size detection when the map mounts inside a flex/tab layout
function InvalidateSizeOnMount() {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100)
    return () => clearTimeout(t)
  }, [map])
  return null
}

// Compact preview card shown inside a marker's popup, with a "View Details" CTA
// that opens the full DetailPanel.
function MapPopupCard({ item, onViewDetails }: { item: Listing; onViewDetails: () => void }) {
  return (
    <div style={{ width: 216, fontFamily: 'Nunito, sans-serif' }}>
      
      <div className="p-3">
        <p className="font-bold text-sm leading-tight truncate" style={{ color: '#f0f2f8', fontFamily: 'DM Serif Display, serif' }}>{item.title}</p>
        <p className="text-xs truncate mt-0.5" style={{ color: '#8892a4' }}>{item.address}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <span className="text-xs" style={{ color: '#8892a4' }}>
            {item.calculatedDistance ? `${item.calculatedDistance.toFixed(1)} km` : item.distance}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
          className="mt-2.5 w-full flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all hover:scale-[1.02] active:scale-95"
          style={{ background: '#f97316', color: '#fff' }}
          type="button"
        >
          View Details <ChevronRightIcon size={13} />
        </button>
      </div>
    </div>
  )
}

function MapView({
  listings: items,
  selected,
  highlighted,
  onHighlight,
  onSelect,
  popupId,
  onPopupIdChange,
  userLocation,
  centerUserTrigger,
}: {
  listings: Listing[]
  selected: number | null
  highlighted: number | null
  onHighlight: (id: number | null) => void
  onSelect: (id: number) => void
  popupId: number | null
  onPopupIdChange: (id: number | null) => void
  userLocation: [number, number] | null
  centerUserTrigger: number
}) {
  const selectedItem = items.find((i) => i.id === selected) ?? null
  const [openPopupId, setOpenPopupId] = useState<number | null>(popupId)
  const markerRefs = useRef<Record<number, L.Marker | null>>({})
  const preservePopupRef = useRef(false)
  const center: [number, number] = [14.5475, 121.0403] // roughly the centroid of all listings

  // Restore the Leaflet popup after the mobile map is remounted when
  // returning from the full rental details view.
  useEffect(() => {
    preservePopupRef.current = false
    setOpenPopupId(popupId)
    if (popupId !== null) {
      const timer = setTimeout(() => {
        markerRefs.current[popupId]?.openPopup()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [popupId])

  return (
    <div className="relative w-full h-full" style={{ background: '#141824' }}>
      <MapContainer center={center} zoom={12} scrollWheelZoom style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <InvalidateSizeOnMount />
        <FlyToSelected item={selectedItem ?? items.find((i) => i.id === highlighted) ?? null} />
        <FlyToUserLocation userLocation={userLocation} trigger={centerUserTrigger} />
        {items.map((item) => (
          <Marker
            key={item.id}
            ref={(instance) => {
              markerRefs.current[item.id] = instance
            }}
            position={[item.lat, item.lng]}
            icon={createPriceIcon(item, selected === item.id || highlighted === item.id || openPopupId === item.id)}
            eventHandlers={{
              click: () => {
                onHighlight(item.id)
              },
              popupopen: () => {
                setOpenPopupId(item.id)
                onPopupIdChange(item.id)
              },
              popupclose: () => {
                // Leaflet can emit popupclose while the map is being unmounted
                // for the mobile details screen. Don't lose the popup state then.
                if (!preservePopupRef.current) {
                  setOpenPopupId((cur) => (cur === item.id ? null : cur))
                  onPopupIdChange(null)
                }
                if (highlighted === item.id) onHighlight(null)
              },
            }}
          >
            <Popup closeButton autoPan className="nearrent-popup" offset={[0, -28]}>
              <MapPopupCard item={item} onViewDetails={() => {
                // Keep the Leaflet popup open when viewing the full rental details.
                preservePopupRef.current = true
                onHighlight(item.id)
                onPopupIdChange(item.id)
                onSelect(item.id)
              }} />
            </Popup>
          </Marker>
        ))}
        <Marker 
          position={userLocation || USER_LOCATION} 
          icon={createUserIcon()} 
          interactive={true}
          eventHandlers={{
            click: () => {
              if (userLocation) {
                // Could show location details in a popup
              }
            }
          }}
        >
          {userLocation && (
            <Popup>
              <div style={{ fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
                <p style={{ fontWeight: 'bold', fontSize: '12px', color: '#f0f2f8' }}>Your Location</p>
                <p style={{ fontSize: '10px', color: '#8892a4' }}>
                  {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#f97316' : 'none'} stroke={filled ? '#f97316' : '#8892a4'} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8892a4" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  )
}
function LocationIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function CloseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function ChevronLeftIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
function ChevronRightIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}
function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

// ─── Skeleton loading component ─────────────────────────────────────────────

function ListingCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: '#191d27', border: '1.5px solid #2a3045' }}>
      <div className="relative w-full animate-pulse" style={{ aspectRatio: '4 / 3', background: '#21273a' }} />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="h-5 w-3/4 rounded animate-pulse" style={{ background: '#2a3045' }} />
        <div className="h-4 w-1/2 rounded animate-pulse" style={{ background: '#2a3045' }} />
        <div className="h-4 w-1/3 rounded animate-pulse" style={{ background: '#2a3045' }} />
      </div>
    </div>
  )
}

// ─── Listing card (grid) ──────────────────────────────────────────────────────

function ListingCard({
  item,
  active,
  onClick,
  onSave,
  saved,
}: {
  item: Listing
  active: boolean
  onClick: () => void
  onSave: (e: React.MouseEvent) => void
  saved: boolean
}) {
  const gallery = useGallery(item.images.length)
  const multi = item.images.length > 1

  return (
    <div
      onClick={onClick}
      className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col hover:shadow-2xl sm:hover:scale-[1.02] active:scale-[0.99]"
      style={{
        background: '#191d27',
        border: active ? '2px solid #f97316' : '1.5px solid #2a3045',
        boxShadow: active ? '0 0 0 4px rgba(249,115,22,0.2), 0 8px 32px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div
        className="relative w-full overflow-hidden touch-pan-y"
        style={{ aspectRatio: '4 / 3', background: '#21273a' }}
        onTouchStart={multi ? gallery.onTouchStart : undefined}
        onTouchMove={multi ? gallery.onTouchMove : undefined}
        onTouchEnd={multi ? gallery.onTouchEnd : undefined}
      >
        <img
          src={item.images[gallery.index]}
          alt={`${item.title} - photo ${gallery.index + 1} of ${item.images.length}`}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.currentTarget.style.opacity = '0' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,17,23,0.7) 0%, transparent 60%)' }} />
        <button
          onClick={onSave}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
        >
          <HeartIcon filled={saved} />
        </button>

        {multi && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); gallery.prev() }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full items-center justify-center transition-opacity max-md:flex max-md:opacity-60 md:flex md:opacity-0 md:group-hover:opacity-100"
              style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
              aria-label="Previous photo"
            >
              <ChevronLeftIcon size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); gallery.next() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full items-center justify-center transition-opacity max-md:flex max-md:opacity-60 md:flex md:opacity-0 md:group-hover:opacity-100"
              style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
              aria-label="Next photo"
            >
              <ChevronRightIcon size={14} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {item.images.map((_, idx) => (
                <span
                  key={idx}
                  className="rounded-full transition-all"
                  style={{
                    width: idx === gallery.index ? 12 : 4,
                    height: 4,
                    background: idx === gallery.index ? '#f97316' : 'rgba(255,255,255,0.55)',
                  }}
                />
              ))}
            </div>
          </>
        )}

        <span className="absolute bottom-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-md" style={{ background: 'rgba(0,0,0,0.6)', color: '#f0f2f8', backdropFilter: 'blur(4px)' }}>
          {item.calculatedDistance ? `${item.calculatedDistance.toFixed(1)} km` : item.distance}
        </span>
      </div>
      <div className="p-3.5 sm:p-4 flex flex-col gap-1.5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="font-bold text-base leading-tight" style={{ color: '#f0f2f8', fontFamily: 'DM Serif Display, serif' }}>{item.title}</span>
          <span className="font-extrabold text-base whitespace-nowrap" style={{ color: '#f97316' }}>₱{item.price.toLocaleString()}</span>
        </div>
        <p className="text-xs truncate" style={{ color: '#8892a4' }}>{item.address}</p>
        <div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#8892a4' }}>
          <span>{item.beds === 0 ? 'Studio' : `${item.beds} BR`}</span>
          <span>·</span>
          <span>{item.baths} BA</span>
          <span>·</span>
          <span>{item.sqft} m²</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>
            {item.propertyType}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Fullscreen lightbox ──────────────────────────────────────────────────────

function Lightbox({ item, initialIndex, onClose }: { item: Listing; initialIndex: number; onClose: () => void }) {
  const gallery = useGallery(item.images.length, initialIndex)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') gallery.prev()
      if (e.key === 'ArrowRight') gallery.next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: 'rgba(6,7,11,0.97)' }}>
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 flex-shrink-0">
        <span className="text-sm font-semibold" style={{ color: '#f0f2f8' }}>
          {gallery.index + 1} / {item.images.length}
        </span>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: '#191d27', border: '1px solid #2a3045', color: '#f0f2f8' }}
          aria-label="Close photo viewer"
        >
          <CloseIcon size={20} />
        </button>
      </div>

      <div
        className="flex-1 relative flex items-center justify-center px-2 min-h-0"
        onTouchStart={gallery.onTouchStart}
        onTouchMove={gallery.onTouchMove}
        onTouchEnd={gallery.onTouchEnd}
      >
        <img
          src={item.images[gallery.index]}
          alt={`${item.title} - photo ${gallery.index + 1} of ${item.images.length}`}
          className="max-w-full max-h-full object-contain rounded-lg select-none"
        />
        {item.images.length > 1 && (
          <>
            <button
              onClick={gallery.prev}
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#f0f2f8' }}
              aria-label="Previous photo"
            >
              <ChevronLeftIcon size={20} />
            </button>
            <button
              onClick={gallery.next}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#f0f2f8' }}
              aria-label="Next photo"
            >
              <ChevronRightIcon size={20} />
            </button>
          </>
        )}
      </div>

      {item.images.length > 1 && (
        <div className="flex-shrink-0 flex gap-2 px-4 sm:px-6 py-4 overflow-x-auto">
          {item.images.map((src, idx) => (
            <button
              key={idx}
              onClick={() => gallery.setIndex(idx)}
              className="flex-shrink-0 rounded-lg overflow-hidden transition-all"
              style={{
                width: 64,
                height: 48,
                border: idx === gallery.index ? '2px solid #f97316' : '2px solid transparent',
                opacity: idx === gallery.index ? 1 : 0.5,
              }}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({
  item,
  onClose,
  saved,
  onSave,
  isMobile,
  onShowMap,
}: {
  item: Listing
  onClose: () => void
  saved: boolean
  onSave: () => void
  isMobile: boolean
  onShowMap: () => void
}) {
  const gallery = useGallery(item.images.length)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const multi = item.images.length > 1

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `${item.title} - ₱${item.price.toLocaleString()}/month`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share failed:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${item.title} - ₱${item.price.toLocaleString()}/month - ${item.address}`)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#0f1117', borderLeft: isMobile ? 'none' : '1px solid #1e2433' }}>
      {/* Hero with image gallery */}
      <div className="relative flex-shrink-0 w-full h-[30vh] min-h-[210px] max-h-[300px] md:h-[340px] md:min-h-0 md:max-h-none">
        <div
          className="relative w-full h-full overflow-hidden touch-pan-y"
          onTouchStart={multi ? gallery.onTouchStart : undefined}
          onTouchMove={multi ? gallery.onTouchMove : undefined}
          onTouchEnd={multi ? gallery.onTouchEnd : undefined}
        >
          <img
            src={item.images[gallery.index]}
            alt={`${item.title} - Image ${gallery.index + 1}`}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
            onError={(e) => { e.currentTarget.style.opacity = '0' }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 45%, rgba(15,17,23,0.95) 100%)' }} />

          {multi && (
            <>
              <button
                onClick={gallery.prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                aria-label="Previous photo"
              >
                <ChevronLeftIcon size={16} />
              </button>
              <button
                onClick={gallery.next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                aria-label="Next photo"
              >
                <ChevronRightIcon size={16} />
              </button>
            </>
          )}

          <div
            className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            {gallery.index + 1} / {item.images.length}
          </div>

          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:scale-105"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <GridIcon /> {item.images.length} photos
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:bg-white/10"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: '#f0f2f8', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <ChevronLeftIcon size={16} /> Back
        </button>

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleShare}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}
            aria-label="Share listing"
          >
            <ShareIcon />
          </button>
          <button
            onClick={onSave}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}
            aria-label={saved ? 'Remove from saved' : 'Save listing'}
          >
            <HeartIcon filled={saved} />
          </button>
        </div>

      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-4 md:pt-5" style={{ paddingBottom: 'calc(112px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#f0f2f8', lineHeight: 1.15 }}>{item.title}</h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>
                {item.propertyType}
              </span>
            </div>
            <p className="text-sm mt-1.5" style={{ color: '#8892a4' }}>
              <span className="font-semibold" style={{ color: '#f0f2f8' }}>Owner:</span> {item.owner}
            </p>
            <p className="text-sm mt-1.5 flex items-center gap-1.5" style={{ color: '#8892a4' }}>
              <LocationIcon />{item.address}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-extrabold text-xl sm:text-2xl" style={{ color: '#f97316' }}>₱{item.price.toLocaleString()}</div>
            <div className="text-xs" style={{ color: '#8892a4' }}>/ month</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5">
          {[
            { label: 'Bedrooms', value: item.beds === 0 ? 'Studio' : item.beds },
            { label: 'Bathrooms', value: item.baths },
            { label: 'Floor Area', value: `${item.sqft} m²` },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center py-3.5 sm:py-4 rounded-xl transition-all hover:scale-105" style={{ background: '#191d27', border: '1px solid #2a3045' }}>
              <span className="font-bold text-base sm:text-lg" style={{ color: '#f0f2f8' }}>{value}</span>
              <span className="text-xs mt-0.5 text-center" style={{ color: '#8892a4' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Availability */}
        <div className="flex items-center gap-1.5 mt-5">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
          <span className="text-sm font-medium" style={{ color: '#22c55e' }}>Available {item.available}</span>
        </div>

        {/* Description */}
        <div className="mt-5">
          <h2 className="font-bold text-base mb-2" style={{ color: '#f0f2f8' }}>About this place</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#8892a4' }}>{item.description}</p>
        </div>

        {/* Photo strip - reinforces that the description has a full gallery behind it */}
        {multi && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-sm" style={{ color: '#f0f2f8' }}>Photos ({item.images.length})</h2>
              <button onClick={() => setLightboxOpen(true)} className="text-xs font-semibold" style={{ color: '#f97316' }}>View all</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {item.images.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => { gallery.setIndex(idx); setLightboxOpen(true) }}
                  className="flex-shrink-0 rounded-lg overflow-hidden transition-all"
                  style={{ width: 88, height: 66, border: idx === gallery.index ? '2px solid #f97316' : '2px solid #2a3045' }}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Amenities */}
        <div className="mt-5">
          <h2 className="font-bold text-base mb-3" style={{ color: '#f0f2f8' }}>Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {item.amenities.map((a) => (
              <span key={a} className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-105" style={{ background: '#191d27', border: '1px solid #2a3045', color: '#c4cfe0' }}>
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* Location chip */}
        <button
          type="button"
          onClick={onShowMap}
          className="mt-5 mb-2 w-full rounded-xl p-4 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.99] text-left"
          style={{ background: '#191d27', border: '1px solid #2a3045', cursor: 'pointer' }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(249,115,22,0.12)' }}>
            <LocationIcon />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: '#f0f2f8' }}>
              {item.calculatedDistance ? `${item.calculatedDistance.toFixed(1)} km` : item.distance} from your location
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#8892a4' }}>
              Approx {Math.round((item.calculatedDistance ?? parseFloat(item.distance)) * 12)} min by commute
            </p>
            <p className="text-xs font-semibold mt-1" style={{ color: '#f97316' }}>View on map →</p>
          </div>
        </button>
      </div>

      {/* CTA */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 sm:px-5 pt-5"
        style={{ background: 'linear-gradient(to top, #0f1117 75%, transparent)', paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex gap-3">
          <button className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95" style={{ background: '#191d27', border: '1.5px solid #2a3045', color: '#f0f2f8' }}>
            Schedule Viewing
          </button>
          <button className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg" style={{ background: '#f97316', color: '#fff', boxShadow: '0 4px 20px rgba(249,115,22,0.3)' }}>
            Inquire Now
          </button>
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox item={item} initialIndex={gallery.index} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  )
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function FilterBar({
  priceIdx, setPriceIdx,
  selectedTypes, setSelectedTypes,
  onClose,
  onClear,
  resultCount,
  isMobile,
}: {
  priceIdx: number; setPriceIdx: (i: number) => void
  selectedTypes: string[]; setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>
  onClose: () => void
  onClear: () => void
  resultCount: number
  isMobile: boolean
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const groups = (
    <div className="grid gap-4">
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: '#8892a4' }}>PRICE RANGE</p>
        <div className="flex gap-2 flex-wrap">
          {priceFilters.map((f, i) => (
            <button key={f} onClick={() => setPriceIdx(i)} className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
              style={{ background: priceIdx === i ? '#f97316' : '#21273a', color: priceIdx === i ? '#fff' : '#8892a4', border: priceIdx === i ? '1.5px solid #f97316' : '1.5px solid #2a3045' }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: '#8892a4' }}>PROPERTY TYPE</p>
        <div className="flex gap-2 flex-wrap">
          {typeFilters.map((f) => (
            <button key={f} onClick={() => {
              if (f === 'All') {
                setSelectedTypes([])
              } else {
                setSelectedTypes((prev) =>
                  prev.includes(f)
                    ? prev.filter((t) => t !== f)
                    : [...prev, f]
                )
              }
            }} className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
              style={{ background: (f === 'All' ? selectedTypes.length === 0 : selectedTypes.includes(f)) ? '#f97316' : '#21273a', color: (f === 'All' ? selectedTypes.length === 0 : selectedTypes.includes(f)) ? '#fff' : '#8892a4', border: (f === 'All' ? selectedTypes.length === 0 : selectedTypes.includes(f)) ? '1.5px solid #f97316' : '1.5px solid #2a3045' }}>
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.6)', opacity: visible ? 1 : 0 }}
          onClick={onClose}
        />
        <div
          className="relative rounded-t-3xl flex flex-col transition-transform duration-300 ease-out"
          style={{
            background: '#12151f',
            border: '1px solid #2a3045',
            borderBottom: 'none',
            maxHeight: '82vh',
            transform: visible ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          <div className="flex justify-center pt-3">
            <div className="w-10 h-1.5 rounded-full" style={{ background: '#2a3045' }} />
          </div>
          <div className="flex items-center justify-between px-5 pt-3 pb-4 flex-shrink-0">
            <h3 className="font-bold text-lg" style={{ color: '#f0f2f8' }}>Filters</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-all" style={{ color: '#8892a4' }}><CloseIcon /></button>
          </div>
          <div className="px-5 overflow-y-auto flex-1">{groups}</div>
          <div
            className="flex-shrink-0 flex gap-3 px-5 pt-4"
            style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid #1e2433' }}
          >
            <button onClick={onClear} className="px-5 py-3 rounded-xl font-bold text-sm" style={{ background: '#191d27', border: '1.5px solid #2a3045', color: '#f0f2f8' }}>
              Clear
            </button>
            <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ background: '#f97316', color: '#fff' }}>
              Show {resultCount} homes
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: '#191d27', border: '1px solid #2a3045' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base" style={{ color: '#f0f2f8' }}>Filters</h3>
        <div className="flex items-center gap-4">
          <button onClick={onClear} className="text-xs font-semibold hover:underline" style={{ color: '#8892a4' }}>Clear all</button>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 transition-all" style={{ color: '#8892a4' }}><CloseIcon /></button>
        </div>
      </div>
      {groups}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [mapPopupId, setMapPopupId] = useState<number | null>(null)
  const [mapHighlightId, setMapHighlightId] = useState<number | null>(null)
  const [savedIds, setSavedIds] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [priceIdx, setPriceIdx] = useState(0)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list')
  const [sortBy, setSortBy] = useState<SortOption>('nearest')
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false))
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [centerUserTrigger, setCenterUserTrigger] = useState<number>(0)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Get user's real location using Geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
          setLocationError(null)
        },
        (error) => {
          setLocationError('Unable to get your location')
          console.error('Geolocation error:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setLocationError('Geolocation not supported by your browser')
    }
  }, [])

  // Simulate loading state
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [priceIdx, selectedTypes, search, sortBy, userLocation])

  const toggleSave = (id: number) =>
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const clearFilters = () => { setPriceIdx(0); setSelectedTypes([]) }

  // Calculate dynamic distances for listings
  const listingsWithDistance = listings.map(item => ({
    ...item,
    calculatedDistance: userLocation
      ? calculateDistance(userLocation[0], userLocation[1], item.lat, item.lng)
      : null
  }))

  const filtered = listingsWithDistance.filter((l) => {
    if (priceIdx === 1 && l.price >= 25000) return false
    if (priceIdx === 2 && (l.price < 25000 || l.price > 50000)) return false
    if (priceIdx === 3 && l.price <= 50000) return false
    if (selectedTypes.length > 0 && !selectedTypes.includes(l.propertyType)) return false
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.address.toLowerCase().includes(search.toLowerCase()) && !l.city.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Sort listings based on selected sort option
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'nearest':
      default:
        // Use calculated distance if available, otherwise fallback to hardcoded distance
        const distA = a.calculatedDistance ?? parseFloat(a.distance)
        const distB = b.calculatedDistance ?? parseFloat(b.distance)
        return distA - distB
    }
  })

  const selectedItem = listingsWithDistance.find((l) => l.id === selectedId) ?? null
  const activeFilters = (priceIdx > 0 ? 1 : 0) + (selectedTypes.length > 0 ? 1 : 0)

  // Handle mobile selection - show detail as full screen
  const handleMobileSelect = (id: number) => {
    setSelectedId(selectedId === id ? null : id)
  }

  // Switch from rental details to the map and highlight this rental.
  const handleShowMap = (id: number) => {
    setMapHighlightId(id)
    setSelectedId(null)
    setActiveTab('map')
  }

  // Center map on user's location
  const handleCenterUser = () => {
    if (userLocation) {
      setMapHighlightId(null)
      setCenterUserTrigger(prev => prev + 1)
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0a0c12', fontFamily: 'Nunito, sans-serif' }}>
      <style>{`
        @keyframes nr-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes nr-fade-in { from { opacity: 0; } to { opacity: 1; } }
        .nr-detail-mobile { animation: nr-slide-up 0.28s cubic-bezier(0.32, 0.72, 0, 1); }
        .nr-detail-desktop { animation: nr-fade-in 0.2s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .nr-detail-mobile, .nr-detail-desktop { animation: none; }
        }
        .nearrent-popup .leaflet-popup-content-wrapper {
          background: #191d27;
          color: #f0f2f8;
          border-radius: 16px;
          border: 1px solid #2a3045;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          padding: 0;
          overflow: hidden;
        }
        .nearrent-popup .leaflet-popup-content {
          margin: 0;
          width: 216px !important;
        }
        .nearrent-popup .leaflet-popup-tip-container { margin-top: -1px; }
        .nearrent-popup .leaflet-popup-tip {
          background: #191d27;
          border: 1px solid #2a3045;
          box-shadow: none;
        }
        .nearrent-popup .leaflet-popup-close-button {
          color: #c4cfe0 !important;
          top: 8px !important;
          right: 8px !important;
          width: 22px !important;
          height: 22px !important;
          font-size: 18px !important;
          background: rgba(0,0,0,0.35);
          border-radius: 9999px;
        }
        .nearrent-popup .leaflet-popup-close-button:hover {
          color: #fff !important;
          background: rgba(0,0,0,0.55);
        }
      `}</style>

      {/* Top nav */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-3 md:py-4" style={{ background: '#0f1117', borderBottom: '1px solid #1e2433' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f97316' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: isMobile ? 18 : 20, color: '#f0f2f8' }}>NearRent<span style={{ color: '#f97316' }}>.ph</span></span>
        </div>

        {isMobile ? (
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 rounded-lg" style={{ background: '#191d27' }} aria-label="Open menu">
            <MenuIcon />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {userLocation ? (
                <div className="flex items-center gap-1.5" title="Using your real location">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
                  <span className="text-xs" style={{ color: '#22c55e' }}>Location enabled</span>
                </div>
              ) : locationError ? (
                <div className="flex items-center gap-1.5" title={locationError}>
                  <div className="w-2 h-2 rounded-full" style={{ background: '#f97316' }} />
                  <span className="text-xs" style={{ color: '#f97316' }}>Using default location</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#8892a4' }} />
                  <span className="text-xs" style={{ color: '#8892a4' }}>Getting location...</span>
                </div>
              )}
            </div>
            <span className="text-sm" style={{ color: '#8892a4' }}>Metro Manila, PH</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#f97316', color: '#fff' }}>JR</div>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      {showMobileMenu && isMobile && (
        <div className="flex-shrink-0 px-4 py-3" style={{ background: '#0f1117', borderBottom: '1px solid #1e2433' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: '#8892a4' }}>Metro Manila, PH</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#f97316', color: '#fff' }}>JR</div>
          </div>
        </div>
      )}

      {/* Search + filter row */}
      <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 py-3 flex gap-2 md:gap-3 items-center" style={{ background: '#0f1117', borderBottom: '1px solid #1e2433' }}>
        <div className="flex-1 min-w-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl" style={{ background: '#191d27', border: '1.5px solid #2a3045' }}>
          <SearchIcon />
          <input
            className="flex-1 min-w-0 bg-transparent text-sm outline-none"
            style={{ color: '#f0f2f8', fontFamily: 'Nunito, sans-serif' }}
            placeholder={isMobile ? 'Search city or property...' : 'Search by city, barangay, or property name...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="opacity-50 hover:opacity-100 flex-shrink-0" aria-label="Clear search"><CloseIcon size={16} /></button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex-shrink-0 flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: activeFilters > 0 ? '#f97316' : '#191d27',
            color: activeFilters > 0 ? '#fff' : '#8892a4',
            border: activeFilters > 0 ? '1.5px solid #f97316' : '1.5px solid #2a3045',
          }}
        >
          <FilterIcon />
          {!isMobile && <span>Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}</span>}
        </button>
        {/* List/Map toggle */}
        <div className="flex-shrink-0 flex rounded-xl overflow-hidden" style={{ border: '1.5px solid #2a3045' }}>
          {(['list', 'map'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                if (t === 'map' && selectedId !== null) {
                  // Keep the selected rental as the map target, then close Details.
                  setMapHighlightId(selectedId)
                  setMapPopupId(selectedId)
                  setSelectedId(null)
                } else if (t === 'list') {
                  // Details should remain closed when returning to List view.
                  setSelectedId(null)
                  setMapPopupId(null)
                  setMapHighlightId(null)
                }
                setActiveTab(t)
              }}
              className="px-3 md:px-4 py-2 text-sm font-semibold capitalize transition-all"
              style={{ background: activeTab === t ? '#f97316' : '#191d27', color: activeTab === t ? '#fff' : '#8892a4' }}
              aria-label={`${t} view`}
            >
              {t === 'list' ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M9 4v16M15 4v16" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20 10.2c0 5.1-8 10.8-8 10.8S4 15.3 4 10.2a8 8 0 1 1 16 0Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
)}
            </button>
          ))}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        isMobile ? (
          <FilterBar
            priceIdx={priceIdx} setPriceIdx={setPriceIdx}
            selectedTypes={selectedTypes} setSelectedTypes={setSelectedTypes}
            onClose={() => setShowFilters(false)}
            onClear={clearFilters}
            resultCount={sorted.length}
            isMobile
          />
        ) : (
          <div className="flex-shrink-0 px-4 md:px-6 py-3" style={{ background: '#0f1117', borderBottom: '1px solid #1e2433' }}>
            <FilterBar
              priceIdx={priceIdx} setPriceIdx={setPriceIdx}
              selectedTypes={selectedTypes} setSelectedTypes={setSelectedTypes}
              onClose={() => setShowFilters(false)}
              onClear={clearFilters}
              resultCount={sorted.length}
              isMobile={false}
            />
          </div>
        )
      )}

      {/* Result count and sort */}
      {!selectedItem && activeTab === 'list' && (
        <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 py-2 flex items-center justify-between gap-2">
          <span className="text-sm" style={{ color: '#8892a4' }}>
            <span className="font-bold" style={{ color: '#f0f2f8' }}>{sorted.length}</span> homes found
          </span>
          <div className="flex items-center gap-2">
            {!isMobile && <span className="text-xs" style={{ color: '#8892a4' }}>Sort by:</span>}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs font-semibold px-2 py-1.5 rounded-lg outline-none cursor-pointer"
              style={{ background: '#191d27', border: '1px solid #2a3045', color: '#f0f2f8', maxWidth: isMobile ? 132 : 'none' }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{isMobile ? option.label : option.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
        {activeTab === 'list' ? (
          // ── List view ──
          <div className="flex flex-1 overflow-hidden relative">
            {/* Cards grid */}
            <div
              className="overflow-y-auto px-3 sm:px-4 md:px-6 py-2 pb-8 mx-auto w-full"
              style={{
                maxWidth: !isMobile && !selectedItem ? 1600 : 'none',
                width: isMobile ? '100%' : (selectedItem ? '38%' : '100%'),
                minWidth: !isMobile && selectedItem ? 340 : 'auto',
                transition: 'width 0.25s ease',
                display: isMobile && selectedItem ? 'none' : 'block',
              }}
            >
              {loading ? (
                <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(150px, 1fr))' : 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <ListingCardSkeleton key={i} />
                  ))}
                </div>
              ) : sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <div className="text-4xl">🏘️</div>
                  <p className="text-base font-semibold text-center px-6" style={{ color: '#8892a4' }}>No listings match your filters</p>
                  <button onClick={() => { clearFilters(); setSearch('') }} className="text-sm font-bold px-4 py-2 rounded-xl" style={{ background: '#f97316', color: '#fff' }}>Clear Filters</button>
                </div>
              ) : (
                <div
                  className="grid gap-3 sm:gap-4"
                  style={{ gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(150px, 1fr))' : (selectedItem ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))') }}
                >
                  {(selectedItem && !isMobile ? [selectedItem] : sorted).map((item) => {
                    const displayItem = listingsWithDistance.find(l => l.id === item.id) || item
                    return (
                    <ListingCard
                      key={item.id}
                      item={displayItem}
                      active={selectedId === item.id}
                      onClick={() => isMobile ? handleMobileSelect(item.id) : setSelectedId(selectedId === item.id ? null : item.id)}
                      saved={savedIds.includes(item.id)}
                      onSave={(e) => { e.stopPropagation(); toggleSave(item.id) }}
                    />
                    )
                  })}
                </div>
              )}
            </div>

            {/* Detail panel */}
            {selectedItem && (
              <div
                key={selectedItem.id}
                className={isMobile ? 'nr-detail-mobile absolute inset-0' : 'nr-detail-desktop overflow-hidden relative'}
                style={{
                  borderLeft: isMobile ? 'none' : '1px solid #1e2433',
                  width: isMobile ? '100%' : 'auto',
                  flex: isMobile ? 'none' : 1,
                  display: isMobile ? 'flex' : 'block',
                }}
              >
                <DetailPanel
                  item={selectedItem}
                  onClose={() => { setSelectedId(null); setMapHighlightId(null) }}
                  saved={savedIds.includes(selectedItem.id)}
                  onSave={() => toggleSave(selectedItem.id)}
                  isMobile={isMobile}
                  onShowMap={() => handleShowMap(selectedItem.id)}
                />
              </div>
            )}
          </div>
        ) : (
          // ── Map view ──
          <div className="flex flex-1 overflow-hidden relative">
            {/* On mobile, replace the map with the full rental details.
                On desktop, keep the map visible beside the detail panel. */}
            {(!isMobile || !selectedItem) && (
              <div className="flex-1 relative">
                <MapView
                  listings={listingsWithDistance}
                  selected={selectedId}
                  highlighted={mapHighlightId}
                  onHighlight={setMapHighlightId}
                  onSelect={(id) => setSelectedId(id)}
                  popupId={mapPopupId}
                  onPopupIdChange={setMapPopupId}
                  userLocation={userLocation}
                  centerUserTrigger={centerUserTrigger}
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: '#191d27', border: '1px solid #2a3045', color: '#f0f2f8' }}>
                    {sorted.length} homes
                  </div>
                  {userLocation && (
                    <button
                      onClick={handleCenterUser}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: '#191d27', border: '1px solid #2a3045', color: '#3b82f6' }}
                      title="Center on your location"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}

            {selectedItem && (
              <div
                key={selectedItem.id}
                className={isMobile ? 'nr-detail-mobile absolute inset-0 z-40' : 'nr-detail-desktop relative overflow-hidden'}
                style={{
                  width: isMobile ? '100%' : 400,
                  borderLeft: isMobile ? 'none' : '1px solid #1e2433',
                  display: isMobile ? 'flex' : 'block',
                }}
              >
                <DetailPanel
                  item={selectedItem}
                  onClose={() => {
                    setSelectedId(null)
                    setMapHighlightId(null)
                  }}
                  saved={savedIds.includes(selectedItem.id)}
                  onSave={() => toggleSave(selectedItem.id)}
                  isMobile={isMobile}
                  onShowMap={() => handleShowMap(selectedItem.id)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}