import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { 
  LogOut, 
  FileEdit, 
  Plus, 
  Trash2, 
  Search, 
  Image as ImageIcon, 
  Loader2, 
  Check, 
  Eye,
  EyeOff,
  Sliders,
  Database,
  PlusCircle,
  X,
  Copy,
  Sparkles,
  Upload,
  Box
} from 'lucide-react'
import { toast } from '../components/ui/sonner'

// Define static lists

interface Watch {
  id: number
  name: string
  brand: string
  audience: 'Mens' | 'Womens'
  factory: string
  priceUSD: string
  priceAED: string
  url: string
  image: string
  thumbnail?: string
  images?: string[]
  movement: string
  casing?: string
  case?: string
  bezel: string
  glass: string
  waterResistance: string
  description: string
  features: string[]
  inStock: boolean
  isVisible: boolean
  model?: string
  reference?: string
  material?: string
  size?: string
  caliber?: string
  warranty?: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'products' | 'homepage' | 'accessories'>('products')
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'arrivals' | 'heritage' | 'atelier' | 'catalogue' | 'testimonials' | 'footer'>('hero')

  // Accessories State
  const [accessories, setAccessories] = useState<any[]>([])
  const [accessoriesLoading, setAccessoriesLoading] = useState(false)
  const [accessoryCategoryFilter, setAccessoryCategoryFilter] = useState('ALL')
  const [editingAccessory, setEditingAccessory] = useState<any | null>(null)
  const [isAccessoryModalOpen, setIsAccessoryModalOpen] = useState(false)
  const [accessoryDeleteConfirmId, setAccessoryDeleteConfirmId] = useState<number | null>(null)
  const [accessoryForm, setAccessoryForm] = useState({
    name: '',
    category: 'Straps',
    brandCompatibility: 'Universal',
    priceAED: '',
    priceUSD: '',
    image: '',
    material: '',
    description: '',
    inStock: true,
    isVisible: true,
  })

  // Homepage Settings form state
  const [homepageForm, setHomepageForm] = useState<any>({
    heroTitle: '',
    heroSubtitleLabel: '',
    heroSubtitleDesc: '',
    heroBodyDescription: '',
    heroCtaLabel: '',
    heroCtaTarget: '',
    heroWatchImageUrl: '',
    heroWatchLabelLine1: '',
    heroWatchLabelLine2: '',
    heroWatchLabelLine3: '',
    heroWatchLabelLine4: '',
    heroStats: [],
    
    specsBarItems: [],
    
    newArrivalsTitle: '',
    craftsmanshipTitle: '',
    newArrivals: [],
    craftsmanshipImages: [],
    
    detailBrand: '',
    detailModel: '',
    detailImage: '',
    detailDesc1: '',
    detailDesc2: '',
    detailSpecs: [],
    
    heritageHeading1: '',
    heritageHeading2: '',
    heritageDesc1: '',
    heritageDesc2: '',
    heritageDesc3: '',
    heritageImage: '',
    heritageCaptionLabel: '',
    heritageCaptionText: '',

    architectureHeading1: '',
    architectureHeading2: '',
    architectureSubhead: '',
    architectureDesc: '',
    architectureImage: '',
    architectureImageAlt: '',

    catalogueEyebrow: '',
    catalogueHeading1: '',
    catalogueHeading2: '',
    catalogueDescription: '',
    
    testimonials: [],
    
    nocturneHeading1: '',
    nocturneHeading2: '',
    nocturneCopy: '',
    nocturneBuildSpec: '',
    nocturneImage: '',
    
    footerHeading: '',
    footerWhatsAppNumber: '',
    footerWhatsAppMessage: '',
    footerLinks: [],
    footerCopyright: '',
    footerContactImage: '',
    salesReps: []
  })
  
  const [homepageLoading, setHomepageLoading] = useState(false)
  const [expandedReps, setExpandedReps] = useState<number[]>([0])
  const [uploadLoadingField, setUploadLoadingField] = useState<string | null>(null)

  // Products table & search states
  const [products, setProducts] = useState<Watch[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [productsLoading, setProductsLoading] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  // Product Form/Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Watch | null>(null)
  const [productForm, setProductForm] = useState<Omit<Watch, 'id'>>({
    name: '',
    brand: 'Rolex',
    audience: 'Mens',
    factory: '',
    priceUSD: '',
    priceAED: '',
    url: '',
    image: '',
    images: [],
    movement: '',
    casing: '904L anti-corrosive stainless steel casing',
    bezel: 'Hand-finished structural bezel',
    glass: 'Ultra-clear sapphire glass with anti-scratch',
    waterResistance: '50m waterproof vacuum tested',
    description: '',
    features: [],
    inStock: true,
    isVisible: true,
    model: '',
    reference: '',
    material: '',
    size: '',
    caliber: '',
    warranty: '2-Year Service Warranty'
  })
  
  const [newFeature, setNewFeature] = useState('')
  const [productLoading, setProductLoading] = useState(false)
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [availableBrandModels, setAvailableBrandModels] = useState<Record<string, string[]>>({})
  const [galleryUploadLoading, setGalleryUploadLoading] = useState(false)

  // Auth Guard check & force LTR for dashboard layout
  useEffect(() => {
    document.documentElement.dir = 'ltr'
    document.documentElement.lang = 'en'
    document.body.classList.remove('is-arabic')
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      navigate('/admin/login')
    } else {
      setToken(adminToken)
    }
  }, [navigate])

  // Prevent body scrolling when modal or delete confirmation is open
  useEffect(() => {
    if (isModalOpen || deleteConfirmId !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isModalOpen, deleteConfirmId])

  // Fetch Homepage copy & Catalogue data
  useEffect(() => {
    if (!token) return
    fetchHomepageData()
    fetchProducts()
    fetchCategories()
  }, [token, page, searchTerm])

  const fetchHomepageData = async () => {
    try {
      const res = await fetch('/api/homepage')
      if (res.ok) {
        const data = await res.json()
        setHomepageForm({
          ...data,
          heroStats: data.heroStats?.length ? data.heroStats : [
            { value: '904L', label: 'Oystersteel finish' },
            { value: '1:1', label: 'Fine detailing' },
            { value: 'DXB', label: 'Collector delivery' },
          ],
          architectureHeading1: data.architectureHeading1 || 'ARCHITECTURE',
          architectureHeading2: data.architectureHeading2 || 'OF TIME',
          architectureSubhead: data.architectureSubhead || 'CASE, DIAL, MOVEMENT',
          architectureDesc: data.architectureDesc || 'Discover the best copy watches and super clone watches in Dubai, crafted with replica-watch detailing, refined case architecture, exposed movement depth, and polished gold finishing for collectors seeking premium replica watches in Dubai.',
          architectureImage: data.architectureImage || 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1783924974/t24_watches_defaults/watch-architecture.webp',
          architectureImageAlt: data.architectureImageAlt || 'Watchmaker assembling a gold skeleton watch movement',
          catalogueEyebrow: data.catalogueEyebrow || 'CURATED WATCH DIRECTORY',
          catalogueHeading1: data.catalogueHeading1 || 'THE SIGNATURE',
          catalogueHeading2: data.catalogueHeading2 || 'CATALOGUE',
          catalogueDescription: data.catalogueDescription || 'Refined timepieces selected for balanced weight, smooth movement, and daily-wear precision.',
        })
      }
    } catch (err) {
      console.error('Error fetching homepage settings:', err)
    }
  }

  const fetchProducts = async () => {
    setProductsLoading(true)
    try {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(searchTerm)}&page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
        setTotalPages(data.pagination.totalPages)
        setTotalItems(data.pagination.totalItems)
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setProductsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?includeHidden=true')
      if (res.ok) {
        const data = await res.json()
        if (data.brands) {
          setAvailableBrands(data.brands.filter((b: string) => b !== 'ALL BRANDS'))
        }
        if (data.brandModels) {
          setAvailableBrandModels(data.brandModels)
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  // Fetch Accessories
  const fetchAdminAccessories = async () => {
    setAccessoriesLoading(true)
    try {
      const res = await fetch('/api/accessories?includeHidden=true')
      if (res.ok) {
        const data = await res.json()
        setAccessories(data.accessories || [])
      }
    } catch (err) {
      console.error('Error fetching accessories:', err)
    } finally {
      setAccessoriesLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'accessories') {
      fetchAdminAccessories()
    }
  }, [activeTab])

  const handleOpenAccessoryModal = (acc?: any) => {
    if (acc) {
      setEditingAccessory(acc)
      setAccessoryForm({
        name: acc.name || '',
        category: acc.category || 'Straps',
        brandCompatibility: acc.brandCompatibility || 'Universal',
        priceAED: acc.priceAED || '',
        priceUSD: acc.priceUSD || '',
        image: acc.image || '',
        material: acc.material || '',
        description: acc.description || '',
        inStock: acc.inStock !== false,
        isVisible: acc.isVisible !== false,
      })
    } else {
      setEditingAccessory(null)
      setAccessoryForm({
        name: '',
        category: 'Straps',
        brandCompatibility: 'Universal',
        priceAED: '',
        priceUSD: '',
        image: '',
        material: '',
        description: '',
        inStock: true,
        isVisible: true,
      })
    }
    setIsAccessoryModalOpen(true)
  }

  const handleSaveAccessory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessoryForm.name || !accessoryForm.priceAED) {
      toast.error('Validation Error', { description: 'Please fill in Name and Price AED.' })
      return
    }

    try {
      const method = editingAccessory ? 'PUT' : 'POST'
      const url = editingAccessory ? `/api/accessories/${editingAccessory.id}` : '/api/accessories'
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(accessoryForm),
      })

      if (res.ok) {
        toast.success(editingAccessory ? 'Accessory Updated' : 'Accessory Created', {
          description: `${accessoryForm.name} saved successfully.`
        })
        setIsAccessoryModalOpen(false)
        setEditingAccessory(null)
        fetchAdminAccessories()
      } else {
        const err = await res.json()
        toast.error('Save Failed', { description: err.error || 'Failed to save accessory.' })
      }
    } catch (err) {
      toast.error('Network Error', { description: 'Failed to connect to server.' })
    }
  }

  const handleToggleAccessoryStock = async (acc: any) => {
    try {
      const res = await fetch(`/api/accessories/${acc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inStock: !acc.inStock }),
      })
      if (res.ok) {
        toast.success('Stock Status Updated')
        fetchAdminAccessories()
      }
    } catch (err) {
      toast.error('Failed to update stock status')
    }
  }

  const handleToggleAccessoryVisibility = async (acc: any) => {
    try {
      const res = await fetch(`/api/accessories/${acc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVisible: !acc.isVisible }),
      })
      if (res.ok) {
        toast.success(acc.isVisible ? 'Accessory Hidden' : 'Accessory Made Visible')
        fetchAdminAccessories()
      }
    } catch (err) {
      toast.error('Failed to update visibility')
    }
  }

  const handleDeleteAccessory = async (id: number) => {
    try {
      const res = await fetch(`/api/accessories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        toast.success('Accessory Deleted')
        setAccessoryDeleteConfirmId(null)
        fetchAdminAccessories()
      } else {
        toast.error('Failed to delete accessory')
      }
    } catch (err) {
      toast.error('Network error deleting accessory')
    }
  }

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    toast.info('Logged Out', {
      description: 'Administrative session ended successfully.'
    })
    navigate('/admin/login')
  }

  // Generic Image Upload Handler
  const handleFieldImageUpload = async (file: File, fieldKey: string, fieldLabel?: string) => {
    setUploadLoadingField(fieldKey)
    const displayName = fieldLabel || fieldKey
    const toastId = toast.loading(`Uploading ${displayName} to Cloudinary...`)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload image')

      setHomepageForm((prev: any) => ({ ...prev, [fieldKey]: data.url }))
      toast.success('Image Uploaded', {
        id: toastId,
        description: `${displayName} image uploaded successfully to Cloudinary.`
      })
    } catch (err: any) {
      toast.error('Upload Failed', {
        id: toastId,
        description: err.message || 'Image upload failed.'
      })
    } finally {
      setUploadLoadingField(null)
    }
  }

  // Product secondary gallery photo upload
  const handleGalleryPhotoUpload = async (file: File) => {
    setGalleryUploadLoading(true)
    const toastId = toast.loading(`Uploading photo to Cloudinary...`)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload image')

      setProductForm(prev => {
        const currentImages = prev.images || []
        const nextMain = prev.image || data.url
        return {
          ...prev,
          images: [...currentImages, data.url],
          image: nextMain
        }
      })
      toast.success('Gallery Photo Uploaded', {
        id: toastId,
        description: 'New watch photo added to gallery successfully.'
      })
    } catch (err: any) {
      toast.error('Upload Failed', {
        id: toastId,
        description: err.message || 'Image upload failed.'
      })
    } finally {
      setGalleryUploadLoading(false)
    }
  }

  // Save Homepage details
  const handleHomepageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHomepageLoading(true)
    const toastId = toast.loading('Saving homepage settings...')
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(homepageForm)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save copy')

      toast.success('Homepage Updated', {
        id: toastId,
        description: 'All copy, hero banners, and section settings saved live.'
      })
    } catch (err: any) {
      toast.error('Save Failed', {
        id: toastId,
        description: err.message || 'Failed to update homepage settings.'
      })
    } finally {
      setHomepageLoading(false)
    }
  }

  // Open product modal (Add / Edit)
  const openProductModal = (product: Watch | null = null) => {
    setEditingProduct(product)
    if (product) {
      // Normalize legacy Gents/Ladies to Mens/Womens if needed
      let normalizedAudience: 'Mens' | 'Womens' = 'Mens';
      if ((product.audience as string) === 'Ladies' || (product.audience as string) === 'Womens') {
        normalizedAudience = 'Womens';
      } else {
        normalizedAudience = 'Mens';
      }

      setProductForm({
        name: product.name,
        brand: product.brand,
        audience: normalizedAudience,
        factory: product.factory,
        priceUSD: product.priceUSD,
        priceAED: product.priceAED,
        url: product.url,
        image: product.image,
        images: product.images || [product.image],
        movement: product.movement,
        casing: product.casing || product.case || '904L anti-corrosive stainless steel casing',
        bezel: product.bezel,
        glass: product.glass,
        waterResistance: product.waterResistance,
        description: product.description,
        features: product.features || [],
        inStock: product.inStock,
        isVisible: product.isVisible !== false,
        model: product.model || '',
        reference: product.reference || '',
        material: product.material || '',
        size: product.size || '',
        caliber: product.caliber || '',
        warranty: product.warranty || '2-Year Service Warranty'
      })
    } else {
      setProductForm({
        name: '',
        brand: 'Rolex',
        audience: 'Mens',
        factory: '',
        priceUSD: '$1,490.00',
        priceAED: 'AED 5,468',
        url: '',
        image: '',
        images: [],
        movement: 'Swiss ETA 3235 automatic sweep movement',
        casing: '904L anti-corrosive stainless steel casing',
        bezel: 'Hand-finished structural bezel',
        glass: 'Ultra-clear sapphire glass with anti-scratch',
        waterResistance: '50m waterproof vacuum tested',
        description: '',
        features: [
          '1:1 original weight & alignments',
          'Sweeping second hand matching Swiss sweep speeds',
          'Super-LumiNova elements'
        ],
        inStock: true,
        isVisible: true,
        model: '',
        reference: '',
        material: '',
        size: '',
        caliber: '',
        warranty: '2-Year Service Warranty'
      })
    }
    setIsModalOpen(true)
  }

  // Add feature tag
  const addFeature = () => {
    const val = newFeature.trim()
    if (!val) return
    if (productForm.features.includes(val)) {
      toast.warning('Tag Already Exists', {
        description: `"${val}" is already added to specifications.`
      })
      return
    }
    setProductForm(prev => ({
      ...prev,
      features: [...prev.features, val]
    }))
    toast.success('Feature Added', {
      description: `Tag "${val}" added to specifications.`
    })
    setNewFeature('')
  }

  // Remove feature tag
  const removeFeature = (idx: number) => {
    const tagName = productForm.features[idx]
    setProductForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx)
    }))
    toast.info('Feature Removed', {
      description: tagName ? `Removed "${tagName}" tag.` : 'Feature tag removed.'
    })
  }

  // Save product (Create or Edit)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productForm.image && (!productForm.images || productForm.images.length === 0)) {
      toast.error('Photo Required', {
        description: 'Please upload or provide at least one watch photo before saving.'
      })
      return
    }

    setProductLoading(true)
    const toastId = toast.loading(
      editingProduct ? 'Updating watch listing...' : 'Adding new watch listing...'
    )
    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}` 
        : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save product')

      toast.success(
        editingProduct ? 'Watch Updated' : 'Watch Published',
        {
          id: toastId,
          description: editingProduct 
            ? `Specifications for ${productForm.name || 'watch'} updated successfully.` 
            : `New listing "${productForm.name || 'watch'}" added to catalogue.`
        }
      )
      setIsModalOpen(false)
      fetchProducts()
      fetchCategories()
    } catch (err: any) {
      toast.error('Save Failed', {
        id: toastId,
        description: err.message || 'Product save failed.'
      })
    } finally {
      setProductLoading(false)
    }
  }

  // Delete product
  const handleDeleteProduct = async (id: number) => {
    const toastId = toast.loading('Deleting watch from database catalog...')
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete operation failed')

      toast.success('Watch Deleted', {
        id: toastId,
        description: 'Watch deleted successfully from database catalog.'
      })
      setDeleteConfirmId(null)
      fetchProducts()
      fetchCategories()
    } catch (err: any) {
      toast.error('Delete Failed', {
        id: toastId,
        description: err.message || 'Failed to delete watch.'
      })
    }
  }

  const handleToggleVisibility = async (product: Watch) => {
    const nextVisibility = product.isVisible === false
    const toastId = toast.loading(
      nextVisibility ? 'Publishing watch to storefront...' : 'Hiding watch from storefront...'
    )
    try {
      const res = await fetch(`/api/admin/products/${product.id}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isVisible: nextVisibility })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Visibility update failed')

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, isVisible: nextVisibility } : item
        )
      )
      toast.success(
        nextVisibility ? 'Watch Visible' : 'Watch Hidden',
        {
          id: toastId,
          description: nextVisibility
            ? `"${product.name}" is now live and visible on the storefront.`
            : `"${product.name}" is hidden from the storefront.`
        }
      )
      fetchCategories()
    } catch (err: any) {
      toast.error('Visibility Update Failed', {
        id: toastId,
        description: err.message || 'Failed to update storefront visibility.'
      })
    }
  }


  if (!token) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  const watchToDelete = products.find((p) => p.id === deleteConfirmId)

  return (
    <div
      dir="ltr"
      lang="en"
      data-no-translate
      className="min-h-screen bg-[#070708] text-white flex flex-col font-sans"
    >
      
      {/* Admin header */}
      <header className="border-b border-white/5 bg-[#0e0e11] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-gold" />
          <h1 className="text-lg tracking-tight font-light text-white">
            DUBAI WATCHES GALLERY <span className="text-gold font-semibold">CMS</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            className="text-xs text-gray-400 hover:text-white transition-colors duration-300 font-mono flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" /> VIEW STOREFRONT
          </a>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 border border-white/10 hover:border-red-500/30 hover:text-red-400 rounded-lg text-xs font-mono text-gray-400 transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> LOG OUT
          </button>
        </div>
      </header>

      {/* Main layout */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-3 md:pb-0 flex-nowrap md:flex-wrap scrollbar-none">
            <button
              onClick={() => setActiveTab('products')}
              className={`whitespace-nowrap px-4 py-3.5 rounded-xl text-xs font-mono tracking-wider transition-all duration-300 flex items-center gap-3 shrink-0 ${
                activeTab === 'products'
                  ? 'bg-gold text-black font-bold shadow-md shadow-gold/20'
                  : 'bg-white/[0.02] border border-white/5 text-gray-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              WATCH CATALOGUE
            </button>

            <button
              onClick={() => setActiveTab('accessories')}
              className={`whitespace-nowrap px-4 py-3.5 rounded-xl text-xs font-mono tracking-wider transition-all duration-300 flex items-center gap-3 shrink-0 ${
                activeTab === 'accessories'
                  ? 'bg-gold text-black font-bold shadow-md shadow-gold/20'
                  : 'bg-white/[0.02] border border-white/5 text-gray-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Box className="w-4 h-4 shrink-0" />
              ACCESSORIES (STRAPS & BOXES)
            </button>

            {[
              { key: 'hero', label: 'HERO & SPECS BAR' },
              { key: 'arrivals', label: 'NEW ARRIVALS' },
              { key: 'heritage', label: 'ARCHITECTURE' },
              { key: 'atelier', label: 'ATELIER SECTION' },
              { key: 'catalogue', label: 'CATALOGUE HEADER' },
              { key: 'testimonials', label: 'CLIENT TESTIMONIALS' },
              { key: 'footer', label: 'FOOTER & CONTACTS' }
            ].map((sub) => (
              <button
                key={sub.key}
                onClick={() => {
                  setActiveTab('homepage')
                  setActiveSubTab(sub.key as any)
                }}
                className={`whitespace-nowrap px-4 py-3.5 rounded-xl text-xs font-mono tracking-wider transition-all duration-300 flex items-center gap-3 shrink-0 ${
                  activeTab === 'homepage' && activeSubTab === sub.key
                    ? 'bg-gold text-black font-bold shadow-md shadow-gold/20'
                    : 'bg-white/[0.02] border border-white/5 text-gray-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <FileEdit className="w-4 h-4 shrink-0" />
                {sub.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 bg-[#0e0e11] border border-white/5 rounded-2xl p-6 xl:p-8 relative min-h-[500px]">
          
          {/* TAB 1: PRODUCT CATALOGUE MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-light text-white">Catalogue Inventory</h2>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    MANAGE WATCH DATA AND PRICES IN THE MONGODB BACKEND
                  </p>
                </div>
                <button
                  onClick={() => openProductModal(null)}
                  className="px-6 py-3.5 bg-gold hover:bg-gold-light text-black text-sm font-mono font-bold tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-gold/10 flex items-center gap-2 cursor-pointer w-fit"
                >
                  <Plus className="w-4 h-4" /> ADD WATCH MODEL
                </button>
              </div>

              {/* Search filter bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search catalogue by name or brand..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                  className="w-full pl-11 pr-4 py-2.5 text-xs rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold/20 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                />
              </div>

              {/* Data Table */}
              {productsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-gold animate-spin" />
                </div>
              ) : products.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm font-mono text-gray-300">
                    <thead>
                      <tr className="border-b border-white/5 text-xs text-gray-400 uppercase tracking-wider font-bold">
                        <th className="pb-3 pl-4">Watch Preview</th>
                        <th className="pb-3">Model Name</th>
                        <th className="pb-3">Brand</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Edition</th>
                        <th className="pb-3">Price USD</th>
                        <th className="pb-3">Price AED</th>
                        <th className="pb-3">Stock</th>
                        <th className="pb-3">Storefront</th>
                        <th className="pb-3 text-right pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {products.map((item) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-white/[0.01] transition-all duration-200 ${
                            item.isVisible === false ? 'opacity-55' : ''
                          }`}
                        >
                          <td className="py-4 pl-4">
                            <a 
                              href={item.image} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="group/thumb relative block w-12 h-12 rounded bg-black border border-white/5 p-1 flex items-center justify-center cursor-zoom-in"
                              title="Click to view full size"
                            >
                              <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover/thumb:scale-110" />
                              <div className="hidden group-hover/thumb:block absolute left-24 top-0 z-[100] w-48 h-48 p-2 bg-[#0e0e11] border border-white/10 rounded-xl shadow-2xl pointer-events-none">
                                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                              </div>
                            </a>
                          </td>
                          <td className="font-semibold text-white max-w-[200px] truncate">{item.name}</td>
                          <td>{item.brand}</td>
                          <td>
                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] uppercase text-gray-300">
                              {item.audience || 'Mens'}
                            </span>
                          </td>
                          <td><span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-gold">{item.factory}</span></td>
                          <td>{item.priceUSD}</td>
                          <td>{item.priceAED}</td>
                          <td>
                            {item.inStock ? (
                              <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase font-bold">In Stock</span>
                            ) : (
                              <span className="text-red-400 text-[10px] bg-red-500/10 px-2 py-0.5 rounded-full uppercase font-bold">Sold Out</span>
                            )}
                          </td>
                          <td>
                            {item.isVisible !== false ? (
                              <span className="inline-flex items-center gap-1.5 text-sky-300 text-[10px] bg-sky-500/10 px-2 py-0.5 rounded-full uppercase font-bold">
                                <Eye className="h-3 w-3" />
                                Visible
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-gray-400 text-[10px] bg-white/5 px-2 py-0.5 rounded-full uppercase font-bold">
                                <EyeOff className="h-3 w-3" />
                                Hidden
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-right pr-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleVisibility(item)}
                                className={`p-2 border rounded transition-all duration-300 cursor-pointer ${
                                  item.isVisible !== false
                                    ? 'border-white/5 hover:border-amber-400/30 hover:text-amber-300'
                                    : 'border-emerald-500/20 text-emerald-400 hover:border-emerald-400/50'
                                }`}
                                title={item.isVisible !== false ? 'Hide from storefront' : 'Show on storefront'}
                                aria-label={item.isVisible !== false ? `Hide ${item.name} from storefront` : `Show ${item.name} on storefront`}
                              >
                                {item.isVisible !== false ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => openProductModal(item)}
                                className="p-2 border border-white/5 hover:border-gold/30 hover:text-gold rounded transition-all duration-300 cursor-pointer"
                                title="Edit specs"
                              >
                                <FileEdit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(item.id)}
                                className="p-2 border border-white/5 hover:border-red-500/30 hover:text-red-400 rounded transition-all duration-300 cursor-pointer"
                                title="Delete model"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination control footer */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                      <span className="text-[10px] text-gray-500 font-mono uppercase">
                        Page {page} of {totalPages} ({totalItems} watches listed)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="px-3 py-1 bg-white/5 border border-white/10 disabled:opacity-30 disabled:pointer-events-none hover:border-gold rounded text-[10px] transition-all duration-300 font-mono text-white cursor-pointer"
                        >
                          PREV
                        </button>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="px-3 py-1 bg-white/5 border border-white/10 disabled:opacity-30 disabled:pointer-events-none hover:border-gold rounded text-[10px] transition-all duration-300 font-mono text-white cursor-pointer"
                        >
                          NEXT
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center px-4">
                  <Sliders className="w-8 h-8 text-gold opacity-50 mb-3" />
                  <p className="text-xs text-gray-500 font-mono uppercase">No watches registered matching search query.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: ACCESSORIES INVENTORY MANAGEMENT */}
          {activeTab === 'accessories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-light text-white">Accessories & Custom Sets</h2>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    MANAGE LUXURY STRAPS AND PRESENTATION BOXES IN THE DATABASE
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAccessoryModal()}
                  className="px-4 py-2.5 bg-gold text-black rounded-xl text-xs font-mono font-bold tracking-wider hover:bg-gold-light transition-all duration-300 flex items-center gap-2 shadow-lg shadow-gold/20 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> ADD NEW ACCESSORY
                </button>
              </div>

              {/* Filters Bar */}
              <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-white/5">
                {(['ALL', 'Straps', 'Boxes'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAccessoryCategoryFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all duration-300 ${
                      accessoryCategoryFilter === cat
                        ? 'bg-gold text-black font-bold'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat === 'ALL' ? 'ALL ACCESSORIES' : cat.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Accessories Grid / List */}
              {accessoriesLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-gold animate-spin" />
                </div>
              ) : accessories.filter((a) => accessoryCategoryFilter === 'ALL' || a.category.toLowerCase() === accessoryCategoryFilter.toLowerCase()).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {accessories
                    .filter((a) => accessoryCategoryFilter === 'ALL' || a.category.toLowerCase() === accessoryCategoryFilter.toLowerCase())
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-2xl border bg-white/[0.02] p-4 flex flex-col justify-between transition-all duration-300 ${
                          item.isVisible ? 'border-white/10 hover:border-gold/40' : 'border-red-500/20 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-16 h-16 rounded-xl bg-black border border-white/10 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                              <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-gold/10 text-gold border border-gold/20">
                                  {item.category}
                                </span>
                                {item.brandCompatibility && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-white/5 text-gray-300 border border-white/10">
                                    {item.brandCompatibility}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs font-medium text-white line-clamp-1">{item.name}</h4>
                              <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-xs font-mono font-bold text-gold">{item.priceAED}</span>
                                <span className="text-[10px] font-mono text-gray-500">{item.priceUSD}</span>
                              </div>
                            </div>
                          </div>

                          {item.material && (
                            <p className="text-[10px] font-mono text-gray-400 line-clamp-1 mb-2">
                              Material: {item.material}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleAccessoryStock(item)}
                              className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase transition-colors ${
                                item.inStock
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                              }`}
                            >
                              {item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                            </button>

                            <button
                              onClick={() => handleToggleAccessoryVisibility(item)}
                              title={item.isVisible ? 'Hide from storefront' : 'Show on storefront'}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                item.isVisible
                                  ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                  : 'bg-red-500/10 border-red-500/30 text-red-400'
                              }`}
                            >
                              {item.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenAccessoryModal(item)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-gold/20 border border-white/10 hover:border-gold/40 text-gray-300 hover:text-gold transition-colors"
                              title="Edit Accessory"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setAccessoryDeleteConfirmId(item.id)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-gray-300 hover:text-red-400 transition-colors"
                              title="Delete Accessory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="h-64 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center px-4">
                  <Box className="w-8 h-8 text-gold opacity-50 mb-3" />
                  <p className="text-xs text-gray-500 font-mono uppercase">No accessories found in this category.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HOMEPAGE SECTIONS CMS */}
          {activeTab === 'homepage' && (
            <div className="space-y-6">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-2xl font-light text-white">
                    Edit Homepage Content &bull; <span className="text-gold font-normal uppercase text-lg">
                      {activeSubTab === 'hero' && 'Hero & Specs'}
                      {activeSubTab === 'arrivals' && 'New Arrivals'}
                      {activeSubTab === 'heritage' && 'Architecture & RM'}
                      {activeSubTab === 'atelier' && 'Atelier Section'}
                      {activeSubTab === 'catalogue' && 'Catalogue Header'}
                      {activeSubTab === 'testimonials' && 'Client Testimonials'}
                      {activeSubTab === 'footer' && 'Footer & Contacts'}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    CMS PANELS TO MODIFY TEXT AND ATTACH CLOUDINARY IMAGES
                  </p>
                </div>
                <button
                  onClick={handleHomepageSubmit}
                  disabled={homepageLoading}
                  className="px-8 py-4 bg-gold hover:bg-gold-light text-black text-sm font-mono font-bold tracking-widest rounded-xl transition-all duration-300 shadow-lg shadow-gold/20 flex items-center justify-center gap-2 cursor-pointer shadow-lg w-fit"
                >
                  {homepageLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      SAVING CHANGES...
                    </>
                  ) : (
                    'SAVE ALL SECTIONS'
                  )}
                </button>
              </div>

              {/* Sub-Tab Forms */}
              <form onSubmit={handleHomepageSubmit} className="space-y-6">
                
                {/* 1. Hero & Specs Bar */}
                {activeSubTab === 'hero' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider block mb-1">Hero Main Title (Use " | " to add a line break)</label>
                        <input
                          type="text"
                          required
                          value={homepageForm.heroTitle || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heroTitle: e.target.value }))}
                          className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:ring-1 focus:ring-gold/30 focus:outline-none transition-all duration-300 font-mono text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider block mb-1">Hero Subtitle Label Prefix (e.g. T24 WATCHES DUBAI:)</label>
                        <input
                          type="text"
                          required
                          value={homepageForm.heroSubtitleLabel || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heroSubtitleLabel: e.target.value }))}
                          className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:ring-1 focus:ring-gold/30 focus:outline-none transition-all duration-300 font-mono text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider block mb-1">Hero Subtitle Description Highlight</label>
                        <input
                          type="text"
                          required
                          value={homepageForm.heroSubtitleDesc || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heroSubtitleDesc: e.target.value }))}
                          className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:ring-1 focus:ring-gold/30 focus:outline-none transition-all duration-300 font-mono text-white"
                        />
                      </div>

                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider block mb-1">Hero Body Paragraph Description</label>
                      <textarea required rows={6}
                        value={homepageForm.heroBodyDescription || ''}
                        onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heroBodyDescription: e.target.value }))}
                        className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:ring-1 focus:ring-gold/30 focus:outline-none transition-all duration-300 font-mono text-white resize-y"
                      />
                    </div>

                    {/* Hero Main Banner Watch Image */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">
                        Hero Main Banner Watch Image
                      </h4>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex-1 w-full flex gap-2">
                          <input
                            type="text"
                            value={homepageForm.heroWatchImageUrl || ''}
                            onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heroWatchImageUrl: e.target.value }))}
                            placeholder="Hero banner watch image URL (Cloudinary or /watch-diver-green.jpg)..."
                            className="flex-1 px-4 py-3 text-xs rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all font-mono text-white"
                          />
                          <label className="px-4 py-3 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shrink-0 select-none">
                            {uploadLoadingField === 'heroWatchImageUrl' ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gold" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span>UPLOAD BANNER</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFieldImageUpload(e.target.files[0], 'heroWatchImageUrl', 'Hero Main Banner')
                                }
                              }}
                            />
                          </label>
                        </div>
                        {homepageForm.heroWatchImageUrl && (
                          <div className="w-16 h-16 bg-black border border-white/10 rounded-lg p-1 flex items-center justify-center shrink-0 overflow-hidden relative">
                            <img src={homepageForm.heroWatchImageUrl} alt="Hero Banner Preview" className="max-h-full max-w-full object-contain" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Floating labels list */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Hero Showcase Floating Labels</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <input
                          type="text"
                          value={homepageForm.heroWatchLabelLine1 || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heroWatchLabelLine1: e.target.value }))}
                          placeholder="Line 1"
                          className="px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 focus:border-gold focus:outline-none font-mono text-white"
                        />
                        <input
                          type="text"
                          value={homepageForm.heroWatchLabelLine2 || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heroWatchLabelLine2: e.target.value }))}
                          placeholder="Line 2"
                          className="px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 focus:border-gold focus:outline-none font-mono text-white"
                        />
                        <input
                          type="text"
                          value={homepageForm.heroWatchLabelLine3 || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heroWatchLabelLine3: e.target.value }))}
                          placeholder="Line 3"
                          className="px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 focus:border-gold focus:outline-none font-mono text-white"
                        />
                        <input
                          type="text"
                          value={homepageForm.heroWatchLabelLine4 || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heroWatchLabelLine4: e.target.value }))}
                          placeholder="Line 4 (Gold)"
                          className="px-3 py-2 text-xs rounded-lg bg-white/[0.02] border border-white/5 focus:border-gold focus:outline-none font-mono text-gold"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Hero Bottom Stats</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(homepageForm.heroStats || []).slice(0, 3).map((stat: any, statIdx: number) => (
                          <div key={statIdx} className="space-y-2 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                            <label className="text-[9px] text-gray-500 uppercase tracking-widest">Stat {statIdx + 1}</label>
                            <input
                              type="text"
                              value={stat.value || ''}
                              onChange={(e) => {
                                const list = [...homepageForm.heroStats]
                                list[statIdx].value = e.target.value
                                setHomepageForm((prev: any) => ({ ...prev, heroStats: list }))
                              }}
                              placeholder="Value"
                              className="w-full px-2 py-1 text-xs rounded bg-white/[0.01] border border-white/5 text-gold"
                            />
                            <input
                              type="text"
                              value={stat.label || ''}
                              onChange={(e) => {
                                const list = [...homepageForm.heroStats]
                                list[statIdx].label = e.target.value
                                setHomepageForm((prev: any) => ({ ...prev, heroStats: list }))
                              }}
                              placeholder="Label"
                              className="w-full px-2 py-1 text-xs rounded bg-white/[0.01] border border-white/5 text-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Specs bar list */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Specs Bar Grid Columns (3 items max)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {homepageForm.specsBarItems && homepageForm.specsBarItems.map((spec: any, specIdx: number) => (
                          <div key={specIdx} className="space-y-2 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                            <label className="text-[9px] text-gray-500 uppercase tracking-widest">Col {specIdx + 1}</label>
                            <input
                              type="text"
                              value={spec.title}
                              onChange={(e) => {
                                const newItems = [...homepageForm.specsBarItems]
                                newItems[specIdx].title = e.target.value
                                setHomepageForm((prev: any) => ({ ...prev, specsBarItems: newItems }))
                              }}
                              placeholder="Title"
                              className="w-full px-2 py-1 text-xs rounded bg-white/[0.01] border border-white/5 text-white"
                            />
                            <input
                              type="text"
                              value={spec.details[0] || ''}
                              onChange={(e) => {
                                const newItems = [...homepageForm.specsBarItems]
                                newItems[specIdx].details[0] = e.target.value
                                setHomepageForm((prev: any) => ({ ...prev, specsBarItems: newItems }))
                              }}
                              placeholder="Detail Line 1"
                              className="w-full px-2 py-1 text-xs rounded bg-white/[0.01] border border-white/5 text-silver"
                            />
                            <input
                              type="text"
                              value={spec.details[1] || ''}
                              onChange={(e) => {
                                const newItems = [...homepageForm.specsBarItems]
                                newItems[specIdx].details[1] = e.target.value
                                setHomepageForm((prev: any) => ({ ...prev, specsBarItems: newItems }))
                              }}
                              placeholder="Detail Line 2"
                              className="w-full px-2 py-1 text-xs rounded bg-white/[0.01] border border-white/5 text-silver"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. New Arrivals Grid */}
                {activeSubTab === 'arrivals' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider block mb-1">New Arrivals Title</label>
                        <input
                          type="text"
                          required
                          value={homepageForm.newArrivalsTitle || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, newArrivalsTitle: e.target.value }))}
                          className="w-full px-4 py-2.5 text-xs rounded-xl bg-white/[0.02] border border-white/5 focus:border-gold focus:outline-none font-mono text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider block mb-1">Craftsmanship Title</label>
                        <input
                          type="text"
                          required
                          value={homepageForm.craftsmanshipTitle || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, craftsmanshipTitle: e.target.value }))}
                          className="w-full px-4 py-2.5 text-xs rounded-xl bg-white/[0.02] border border-white/5 focus:border-gold focus:outline-none font-mono text-white"
                        />
                      </div>
                    </div>

                    {/* New Arrivals list items */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">New Arrival Showcases (2 items)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {homepageForm.newArrivals && homepageForm.newArrivals.map((item: any, idx: number) => (
                          <div key={idx} className="space-y-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-gray-500">ARRIVAL CARD {idx + 1}</span>
                              <span className="text-[10px] text-gold font-semibold uppercase">{item.label}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="number"
                                placeholder="Target Product ID"
                                value={item.id}
                                onChange={(e) => {
                                  const list = [...homepageForm.newArrivals]
                                  list[idx].id = parseInt(e.target.value) || 0
                                  setHomepageForm((prev: any) => ({ ...prev, newArrivals: list }))
                                }}
                                className="px-3 py-1.5 text-xs rounded bg-white/[0.02] border border-white/5"
                              />
                              <input
                                type="text"
                                placeholder="Card Badge (e.g. BEST SELLER)"
                                value={item.label}
                                onChange={(e) => {
                                  const list = [...homepageForm.newArrivals]
                                  list[idx].label = e.target.value
                                  setHomepageForm((prev: any) => ({ ...prev, newArrivals: list }))
                                }}
                                className="px-3 py-1.5 text-xs rounded bg-white/[0.02] border border-white/5"
                              />
                              <input
                                type="text"
                                placeholder="Watch Model Title"
                                value={item.name}
                                onChange={(e) => {
                                  const list = [...homepageForm.newArrivals]
                                  list[idx].name = e.target.value
                                  setHomepageForm((prev: any) => ({ ...prev, newArrivals: list }))
                                }}
                                className="col-span-2 px-3 py-1.5 text-xs rounded bg-white/[0.02] border border-white/5"
                              />
                              <input
                                type="text"
                                placeholder="Sub-label Spec (e.g. Swiss Edition)"
                                value={item.type}
                                onChange={(e) => {
                                  const list = [...homepageForm.newArrivals]
                                  list[idx].type = e.target.value
                                  setHomepageForm((prev: any) => ({ ...prev, newArrivals: list }))
                                }}
                                className="col-span-2 px-3 py-1.5 text-xs rounded bg-white/[0.02] border border-white/5"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-xs text-gray-300 font-mono uppercase tracking-wider block font-bold mb-1">WATCH PICTURE URL</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={item.image}
                                  onChange={(e) => {
                                    const list = [...homepageForm.newArrivals]
                                    list[idx].image = e.target.value
                                    setHomepageForm((prev: any) => ({ ...prev, newArrivals: list }))
                                  }}
                                  className="flex-1 px-3 py-1 text-xs rounded bg-white/[0.02] border border-white/5"
                                />
                                  <label className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] rounded cursor-pointer select-none transition-all flex items-center gap-1">
                                    {uploadLoadingField === `newArrivals_${idx}` ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
                                    ) : (
                                      <Upload className="w-3.5 h-3.5" />
                                    )}
                                    <span>{uploadLoadingField === `newArrivals_${idx}` ? '...' : 'UPLOAD'}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          setUploadLoadingField(`newArrivals_${idx}`)
                                          const toastId = toast.loading(`Uploading Arrival Card ${idx + 1} image...`)
                                          const file = e.target.files[0]
                                          const formData = new FormData()
                                          formData.append('image', file)
                                          try {
                                            const res = await fetch('/api/admin/upload', {
                                              method: 'POST',
                                              headers: { 'Authorization': `Bearer ${token}` },
                                              body: formData
                                            })
                                            const upRes = await res.json()
                                            if (res.ok) {
                                              const list = [...homepageForm.newArrivals]
                                              list[idx].image = upRes.url
                                              setHomepageForm((prev: any) => ({ ...prev, newArrivals: list }))
                                              toast.success('Arrival Photo Uploaded', {
                                                id: toastId,
                                                description: `Arrival Card ${idx + 1} photo updated.`
                                              })
                                            } else {
                                              throw new Error(upRes.error || 'Upload failed')
                                            }
                                          } catch (err: any) {
                                            toast.error('Upload Failed', {
                                              id: toastId,
                                              description: err.message || 'Image upload failed.'
                                            })
                                          } finally {
                                            setUploadLoadingField(null)
                                          }
                                        }
                                      }}
                                    />
                                  </label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Craftsmanship list items */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Craftsmanship Showcase Cards (2 items)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {homepageForm.craftsmanshipImages && homepageForm.craftsmanshipImages.map((item: any, idx: number) => (
                          <div key={idx} className="space-y-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <span className="text-[10px] text-gray-500">CRAFTSMANSHIP CARD {idx + 1}</span>
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="number"
                                placeholder="Target Product ID"
                                value={item.id}
                                onChange={(e) => {
                                  const list = [...homepageForm.craftsmanshipImages]
                                  list[idx].id = parseInt(e.target.value) || 0
                                  setHomepageForm((prev: any) => ({ ...prev, craftsmanshipImages: list }))
                                }}
                                className="px-3 py-1.5 text-xs rounded bg-white/[0.02] border border-white/5"
                              />
                              <input
                                type="text"
                                placeholder="Alternative text description"
                                value={item.alt}
                                onChange={(e) => {
                                  const list = [...homepageForm.craftsmanshipImages]
                                  list[idx].alt = e.target.value
                                  setHomepageForm((prev: any) => ({ ...prev, craftsmanshipImages: list }))
                                }}
                                className="px-3 py-1.5 text-xs rounded bg-white/[0.02] border border-white/5"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-xs text-gray-300 font-mono uppercase tracking-wider block font-bold mb-1">WATCH PICTURE URL</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={item.image}
                                  onChange={(e) => {
                                    const list = [...homepageForm.craftsmanshipImages]
                                    list[idx].image = e.target.value
                                    setHomepageForm((prev: any) => ({ ...prev, craftsmanshipImages: list }))
                                  }}
                                  className="flex-1 px-3 py-1 text-xs rounded bg-white/[0.02] border border-white/5"
                                />
                                <label className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] rounded cursor-pointer select-none transition-all flex items-center gap-1">
                                  {uploadLoadingField === `craftsmanship_${idx}` ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
                                  ) : (
                                    <Upload className="w-3.5 h-3.5" />
                                  )}
                                  <span>{uploadLoadingField === `craftsmanship_${idx}` ? '...' : 'UPLOAD'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        setUploadLoadingField(`craftsmanship_${idx}`)
                                        const toastId = toast.loading(`Uploading Craftsmanship Card ${idx + 1} image...`)
                                        const file = e.target.files[0]
                                        const formData = new FormData()
                                        formData.append('image', file)
                                        try {
                                          const res = await fetch('/api/admin/upload', {
                                            method: 'POST',
                                            headers: { 'Authorization': `Bearer ${token}` },
                                            body: formData
                                          })
                                          const upRes = await res.json()
                                          if (res.ok) {
                                            const list = [...homepageForm.craftsmanshipImages]
                                            list[idx].image = upRes.url
                                            setHomepageForm((prev: any) => ({ ...prev, craftsmanshipImages: list }))
                                            toast.success('Craftsmanship Photo Uploaded', {
                                              id: toastId,
                                              description: `Craftsmanship Card ${idx + 1} photo updated.`
                                            })
                                          } else {
                                            throw new Error(upRes.error || 'Upload failed')
                                          }
                                        } catch (err: any) {
                                          toast.error('Upload Failed', {
                                            id: toastId,
                                            description: err.message || 'Image upload failed.'
                                          })
                                        } finally {
                                          setUploadLoadingField(null)
                                        }
                                      }
                                    }}
                                  />
                                </label>

                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Architecture of Time */}
                {activeSubTab === 'heritage' && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Architecture of Time section</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={homepageForm.architectureHeading1 || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, architectureHeading1: e.target.value }))}
                          placeholder="Heading Line 1"
                          className="px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5"
                        />
                        <input
                          type="text"
                          value={homepageForm.architectureHeading2 || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, architectureHeading2: e.target.value }))}
                          placeholder="Heading Line 2"
                          className="px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5"
                        />
                        <input
                          type="text"
                          value={homepageForm.architectureSubhead || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, architectureSubhead: e.target.value }))}
                          placeholder="Subhead, e.g. CASE, DIAL, MOVEMENT"
                          className="px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-gold col-span-2"
                        />
                        <div className="space-y-1 col-span-2">
                          <label className="text-xs text-gray-300 font-mono uppercase tracking-wider block font-bold mb-1">ARCHITECTURE IMAGE</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={homepageForm.architectureImage || ''}
                              onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, architectureImage: e.target.value }))}
                              className="flex-1 px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-white"
                            />
                            <label className="px-4 py-2 bg-white/5 border border-white/10 text-white text-xs rounded cursor-pointer select-none">
                              {uploadLoadingField === 'architectureImage' ? '...' : 'UPLOAD'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleFieldImageUpload(e.target.files[0], 'architectureImage')
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <textarea rows={6}
                          value={homepageForm.architectureDesc || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, architectureDesc: e.target.value }))}
                          placeholder="Architecture body paragraph"
                          className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono resize-y min-h-[140px] focus:border-gold focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3 pt-2">
                        <input
                          type="text"
                          value={homepageForm.architectureImageAlt || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, architectureImageAlt: e.target.value }))}
                          placeholder="Image alt text"
                          className="px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-white"
                        />
                      </div>
                    </div>

                  </div>
                )}

                {/* 4. T24 Atelier Section */}
                {activeSubTab === 'atelier' && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">T24 Atelier section</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={homepageForm.heritageHeading1 || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heritageHeading1: e.target.value }))}
                          placeholder="Heading Line 1, e.g. T24"
                          className="px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5"
                        />
                        <input
                          type="text"
                          value={homepageForm.heritageHeading2 || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heritageHeading2: e.target.value }))}
                          placeholder="Heading Line 2, e.g. ATELIER"
                          className="px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5"
                        />
                        <div className="space-y-1 col-span-2">
                          <label className="text-xs text-gray-300 font-mono uppercase tracking-wider block font-bold mb-1">ATELIER IMAGE</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={homepageForm.heritageImage || ''}
                              onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heritageImage: e.target.value }))}
                              className="flex-1 px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-white"
                            />
                            <label className="px-4 py-2 bg-white/5 border border-white/10 text-white text-xs rounded cursor-pointer select-none">
                              {uploadLoadingField === 'heritageImage' ? '...' : 'UPLOAD'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleFieldImageUpload(e.target.files[0], 'heritageImage')
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <textarea rows={5}
                          value={homepageForm.heritageDesc1 || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heritageDesc1: e.target.value }))}
                          placeholder="Atelier paragraph 1"
                          className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono resize-y min-h-[120px] focus:border-gold focus:outline-none"
                        />
                        <textarea rows={5}
                          value={homepageForm.heritageDesc2 || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heritageDesc2: e.target.value }))}
                          placeholder="Atelier paragraph 2"
                          className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono resize-y min-h-[120px] focus:border-gold focus:outline-none"
                        />
                        <textarea rows={5}
                          value={homepageForm.heritageDesc3 || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heritageDesc3: e.target.value }))}
                          placeholder="Atelier paragraph 3"
                          className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono resize-y min-h-[120px] focus:border-gold focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <input
                          type="text"
                          value={homepageForm.heritageCaptionLabel || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heritageCaptionLabel: e.target.value }))}
                          placeholder="Image caption label"
                          className="px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-gold"
                        />
                        <input
                          type="text"
                          value={homepageForm.heritageCaptionText || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, heritageCaptionText: e.target.value }))}
                          placeholder="Image caption text"
                          className="px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Signature Catalogue Header */}
                {activeSubTab === 'catalogue' && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">
                        Signature catalogue header
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-gray-300 font-mono uppercase tracking-wider block font-bold mb-1">
                            EYEBROW TEXT
                          </label>
                          <input
                            type="text"
                            value={homepageForm.catalogueEyebrow || ''}
                            onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, catalogueEyebrow: e.target.value }))}
                            placeholder="CURATED WATCH DIRECTORY"
                            className="w-full px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-gold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 font-mono uppercase tracking-wider block font-bold mb-1">
                            HEADING LINE 1
                          </label>
                          <input
                            type="text"
                            value={homepageForm.catalogueHeading1 || ''}
                            onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, catalogueHeading1: e.target.value }))}
                            placeholder="THE SIGNATURE"
                            className="w-full px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 font-mono uppercase tracking-wider block font-bold mb-1">
                            HEADING LINE 2
                          </label>
                          <input
                            type="text"
                            value={homepageForm.catalogueHeading2 || ''}
                            onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, catalogueHeading2: e.target.value }))}
                            placeholder="CATALOGUE"
                            className="w-full px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-gold"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-gray-300 font-mono uppercase tracking-wider block font-bold mb-1">
                            DESCRIPTION
                          </label>
                          <textarea
                            rows={5}
                            value={homepageForm.catalogueDescription || ''}
                            onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, catalogueDescription: e.target.value }))}
                            placeholder="Refined timepieces selected for balanced weight, smooth movement, and daily-wear precision."
                            className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono resize-y min-h-[120px] focus:border-gold focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Client reviews and testimonials list */}
                {activeSubTab === 'testimonials' && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Client Reviews CMS</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...(homepageForm.testimonials || [])]
                            const maxId = list.reduce((max: number, t: any) => Math.max(max, t.id || 0), 0)
                            list.push({
                              id: maxId + 1,
                              name: 'New Collector',
                              location: 'Dubai, UAE',
                              role: 'Enthusiast',
                              watchBought: 'Rolex Submariner (Premium Edition)',
                              rating: 5,
                              quote: 'Exceptional details and weight distribution. Truly clone configurations.'
                            })
                            setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                            toast.success('Testimonial Added', {
                              description: 'New review card created. Remember to click SAVE ALL SECTIONS.'
                            })
                          }}
                          className="px-2.5 py-1 bg-gold/10 border border-gold/20 hover:bg-gold/20 text-gold rounded font-mono text-[9px] tracking-wider transition-all duration-300 flex items-center gap-1 cursor-pointer select-none"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> ADD TESTIMONIAL
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {homepageForm.testimonials && homepageForm.testimonials.map((test: any, idx: number) => (
                          <div key={idx} className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4 relative group hover:border-gold/30 transition-all duration-300">
                            
                            <button
                              type="button"
                              onClick={() => {
                                const list = homepageForm.testimonials.filter((_: any, tIdx: number) => tIdx !== idx)
                                setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                toast.info('Testimonial Removed', {
                                  description: 'Review card removed from homepage list.'
                                })
                              }}
                              className="absolute top-6 right-6 text-gray-400 hover:text-red-400 p-1.5 border border-white/10 hover:border-red-500/20 rounded-lg cursor-pointer transition-all duration-200"
                              title="Delete testimonial"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            <div className="space-y-4 pr-8">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[11px] text-gray-400 font-mono uppercase tracking-wider block font-bold">Client Name</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Fahad Al-Mansoori"
                                    value={test.name}
                                    onChange={(e) => {
                                      const list = [...homepageForm.testimonials]
                                      list[idx].name = e.target.value
                                      setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                    }}
                                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-white/[0.01] border border-white/10 text-white font-mono focus:border-gold focus:outline-none transition-all"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-gray-400 font-mono uppercase tracking-wider block font-bold">Location</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Dubai Marina, UAE"
                                    value={test.location}
                                    onChange={(e) => {
                                      const list = [...homepageForm.testimonials]
                                      list[idx].location = e.target.value
                                      setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                    }}
                                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-white/[0.01] border border-white/10 text-white font-mono focus:border-gold focus:outline-none transition-all"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[11px] text-gray-400 font-mono uppercase tracking-wider block font-bold">Client Role / Profession</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Watch Collector"
                                    value={test.role}
                                    onChange={(e) => {
                                      const list = [...homepageForm.testimonials]
                                      list[idx].role = e.target.value
                                      setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                    }}
                                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-white/[0.01] border border-white/10 text-white font-mono focus:border-gold focus:outline-none transition-all"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-gray-400 font-mono uppercase tracking-wider block font-bold">Watch Model Purchased</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Rolex Daytona Panda"
                                    value={test.watchBought}
                                    onChange={(e) => {
                                      const list = [...homepageForm.testimonials]
                                      list[idx].watchBought = e.target.value
                                      setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                    }}
                                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-white/[0.01] border border-white/10 text-gold font-mono focus:border-gold focus:outline-none transition-all"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[11px] text-gray-400 font-mono uppercase tracking-wider block font-bold">Rating Score</label>
                                  <select
                                    value={test.rating || 5}
                                    onChange={(e) => {
                                      const list = [...homepageForm.testimonials]
                                      list[idx].rating = parseInt(e.target.value) || 5
                                      setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                    }}
                                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-[#0e0e11] border border-white/10 text-white font-mono focus:border-gold focus:outline-none transition-all"
                                  >
                                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-gray-400 font-mono uppercase tracking-wider block font-bold">Client Avatar Image URL</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. https://images.unsplash.com/photo-..."
                                    value={test.avatar || ''}
                                    onChange={(e) => {
                                      const list = [...homepageForm.testimonials]
                                      list[idx].avatar = e.target.value
                                      setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                    }}
                                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-white/[0.01] border border-white/10 text-white font-mono focus:border-gold focus:outline-none transition-all"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] text-gray-400 font-mono uppercase tracking-wider block font-bold">Client Review Quote Description</label>
                              <textarea rows={6}
                                placeholder="Write testimonial description..."
                                value={test.quote}
                                onChange={(e) => {
                                  const list = [...homepageForm.testimonials]
                                  list[idx].quote = e.target.value
                                  setHomepageForm((prev: any) => ({ ...prev, testimonials: list }))
                                }}
                                className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.01] border border-white/10 text-gray-200 focus:border-gold focus:outline-none resize-y font-mono min-h-[160px]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Footer and Contacts information */}
                {activeSubTab === 'footer' && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Footer contacts & links</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 font-mono uppercase tracking-wider block font-bold mb-1">FOOTER CONTACT HEADING (e.g. CONTACT US)</label>
                          <input
                            type="text"
                            value={homepageForm.footerHeading || ''}
                            onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, footerHeading: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 font-mono uppercase tracking-wider block font-bold mb-1">GLOBAL FALLBACK WHATSAPP NUMBER (NO SPACES)</label>
                          <input
                            type="text"
                            value={homepageForm.footerWhatsAppNumber || ''}
                            onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, footerWhatsAppNumber: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-300 font-mono uppercase tracking-wider block font-bold mb-1">DEFAULT FOOTER WHATSAPP MESSAGE TEXT</label>
                        <textarea rows={6}
                          value={homepageForm.footerWhatsAppMessage || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, footerWhatsAppMessage: e.target.value }))}
                          className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono resize-y min-h-[140px] focus:border-gold focus:outline-none"
                        />
                      </div>

                      {/* Sales Representatives Rotation Management Section */}
                      <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-2">
                          <div>
                            <h4 className="text-xs text-gold font-mono uppercase font-bold tracking-wider">Sales Representatives (WhatsApp Rotation)</h4>
                            <p className="text-[10px] text-gray-400 font-mono mt-1">Add, update, or remove agents. Active agents are rotated automatically on buttons to distribute inquiries.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const reps = homepageForm.salesReps ? [...homepageForm.salesReps] : [];
                              reps.push({ name: 'New Agent', number: '', isActive: true, isFeatured: false });
                              setHomepageForm((prev: any) => ({ ...prev, salesReps: reps }));
                              setExpandedReps((prev) => [...prev, reps.length - 1]);
                              toast.success('Agent Added', {
                                description: 'New sales representative added to WhatsApp rotation.'
                              });
                            }}
                            className="px-3 py-1.5 bg-gold hover:bg-gold/80 text-dark text-xs font-mono font-bold rounded uppercase tracking-wider transition-colors duration-200 self-start cursor-pointer"
                          >
                            + Add Agent
                          </button>
                        </div>

                        {/* Accordion List */}
                        <div className="space-y-3">
                          {!homepageForm.salesReps || homepageForm.salesReps.length === 0 ? (
                            <div className="text-center py-6 text-xs text-gray-500 font-mono">No representatives configured. Will fall back to default number.</div>
                          ) : (
                            homepageForm.salesReps.map((rep: any, idx: number) => {
                              const isExpanded = expandedReps.includes(idx);
                              return (
                                <div key={idx} className="border border-white/10 rounded-lg bg-white/[0.01] overflow-hidden transition-all duration-300 hover:border-gold/30">
                                  {/* Accordion Header */}
                                  <div 
                                    onClick={() => {
                                      setExpandedReps(prev => 
                                        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                                      );
                                    }}
                                    className="flex items-center justify-between p-3.5 bg-white/[0.02] cursor-pointer select-none"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-mono font-bold text-white">{rep.name || `Unnamed Agent #${idx + 1}`}</span>
                                      {rep.isFeatured && (
                                        <span className="px-2 py-0.5 text-[9px] bg-gold/20 border border-gold/30 text-gold rounded font-mono font-bold uppercase">Featured</span>
                                      )}
                                      {!rep.isActive && (
                                        <span className="px-2 py-0.5 text-[9px] bg-red-900/20 border border-red-500/30 text-red-400 rounded font-mono uppercase">Inactive</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-gray-500 font-mono">{rep.number || 'No number'}</span>
                                      <svg
                                        className={`w-4 h-4 text-gray-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </div>
                                  </div>

                                  {/* Accordion Body */}
                                  {isExpanded && (
                                    <div className="p-4 border-t border-white/5 bg-black/40 space-y-4 font-mono text-xs text-gray-300">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Representative Name</label>
                                          <input
                                            type="text"
                                            value={rep.name}
                                            onChange={(e) => {
                                              const reps = [...homepageForm.salesReps];
                                              reps[idx].name = e.target.value;
                                              setHomepageForm((prev: any) => ({ ...prev, salesReps: reps }));
                                            }}
                                            className="w-full px-3 py-2 rounded bg-white/[0.02] border border-white/10 text-white text-xs"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">WhatsApp Number (e.g. 971501234567)</label>
                                          <input
                                            type="text"
                                            value={rep.number}
                                            onChange={(e) => {
                                              const reps = [...homepageForm.salesReps];
                                              reps[idx].number = e.target.value.replace(/\s+/g, ''); // strip spaces
                                              setHomepageForm((prev: any) => ({ ...prev, salesReps: reps }));
                                            }}
                                            className="w-full px-3 py-2 rounded bg-white/[0.02] border border-white/10 text-white text-xs font-mono"
                                            placeholder="971501234567"
                                          />
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                        <div className="flex gap-6">
                                          <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              checked={rep.isActive}
                                              onChange={(e) => {
                                                const reps = [...homepageForm.salesReps];
                                                reps[idx].isActive = e.target.checked;
                                                setHomepageForm((prev: any) => ({ ...prev, salesReps: reps }));
                                              }}
                                              className="rounded border-white/10 bg-white/[0.02] text-gold focus:ring-0"
                                            />
                                            <span>Active (Included in rotation)</span>
                                          </label>

                                          <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              checked={rep.isFeatured}
                                              onChange={(e) => {
                                                const reps = [...homepageForm.salesReps];
                                                reps[idx].isFeatured = e.target.checked;
                                                setHomepageForm((prev: any) => ({ ...prev, salesReps: reps }));
                                              }}
                                              className="rounded border-white/10 bg-white/[0.02] text-gold focus:ring-0"
                                            />
                                            <span className="text-gold">Featured (Highlighted in UI)</span>
                                          </label>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            const reps = homepageForm.salesReps.filter((_: any, i: number) => i !== idx);
                                            setHomepageForm((prev: any) => ({ ...prev, salesReps: reps }));
                                            setExpandedReps(prev => prev.filter(i => i !== idx).map(i => i > idx ? i - 1 : i));
                                            toast.info('Agent Removed', {
                                              description: 'Sales representative removed from rotation.'
                                            });
                                          }}
                                          className="px-3 py-1 bg-red-950/40 hover:bg-red-900 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white rounded uppercase font-bold text-[10px] tracking-wider transition-all duration-200 cursor-pointer"
                                        >
                                          Delete Agent
                                        </button>

                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-300 font-mono uppercase tracking-wider block font-bold mb-1">FOOTER COPYRIGHT STATEMENT</label>
                        <input
                          type="text"
                          value={homepageForm.footerCopyright || ''}
                          onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, footerCopyright: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-300 font-mono uppercase tracking-wider block font-bold mb-1">CONTACT US BACKGROUND IMAGE (SWISS ALPS)</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="text"
                            value={homepageForm.footerContactImage || ''}
                            onChange={(e) => setHomepageForm((prev: any) => ({ ...prev, footerContactImage: e.target.value }))}
                            className="flex-1 px-3 py-2 text-xs rounded bg-white/[0.02] border border-white/5 text-white font-mono"
                            placeholder="/swiss-alps.jpg"
                          />
                          <label className="cursor-pointer px-4 py-2 bg-gold hover:bg-gold/80 text-dark text-xs font-bold rounded uppercase tracking-wider transition-colors duration-200">
                            {uploadLoadingField === 'footerContactImage' ? '...' : 'UPLOAD'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFieldImageUpload(e.target.files[0], 'footerContactImage')
                                }
                              }}
                              className="hidden"
                              disabled={uploadLoadingField === 'footerContactImage'}
                            />
                          </label>
                        </div>
                        {homepageForm.footerContactImage && (
                          <div className="mt-2 w-32 h-20 rounded border border-white/10 overflow-hidden relative">
                            <img
                              src={homepageForm.footerContactImage}
                              alt="Contact Us Background Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer links groups */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                      <h4 className="text-[10px] text-gold font-mono uppercase font-bold tracking-wider">Footer Navigation Links Groups (4 lists)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {homepageForm.footerLinks && homepageForm.footerLinks.map((group: any, gIdx: number) => (
                          <div key={gIdx} className="space-y-2 p-3 bg-white/[0.02] border border-white/5 rounded-lg text-xs font-mono">
                            <span className="text-[9px] text-gray-500">GROUP {gIdx + 1} TITLE</span>
                            <input
                              type="text"
                              value={group.title}
                              onChange={(e) => {
                                const list = [...homepageForm.footerLinks]
                                list[gIdx].title = e.target.value
                                setHomepageForm((prev: any) => ({ ...prev, footerLinks: list }))
                              }}
                              className="w-full px-2 py-1 rounded bg-white/[0.02] border border-white/5 text-gold font-semibold uppercase"
                            />
                            
                            <span className="text-[9px] text-gray-500 block pt-1">LINKS (COMMA SEPARATED)</span>
                            <textarea rows={6}
                              value={group.links ? group.links.join(', ') : ''}
                              onChange={(e) => {
                                const list = [...homepageForm.footerLinks]
                                list[gIdx].links = e.target.value.split(',').map(s => s.trim())
                                setHomepageForm((prev: any) => ({ ...prev, footerLinks: list }))
                              }}
                              className="w-full px-4 py-3.5 text-sm rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono resize-y min-h-[140px] focus:border-gold focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submitting form buttons at footer */}
                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={homepageLoading}
                    className="px-6 py-3.5 bg-gold hover:bg-gold-light text-black text-xs font-mono font-bold tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[0_4px_15px_rgba(212,175,55,0.2)] w-fit"
                  >
                    {homepageLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        SAVING HOMEPAGE COPY...
                      </>
                    ) : (
                      'SAVE HOMEPAGE COPY CHANGES'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </section>
      </main>

      {isModalOpen && (
        <div key={editingProduct ? `edit-${editingProduct.id}` : 'new-product'} className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm p-4 sm:p-6 md:p-10 flex items-start justify-center overflow-y-auto" data-lenis-prevent>
          <div className="relative w-full max-w-3xl max-h-none sm:max-h-[calc(100vh-5rem)] bg-[#0e0e11] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs font-mono text-white my-4 sm:my-8">
            
            {/* Corner styling borders */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-gold/30 rounded-tl-2xl pointer-events-none z-10" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-gold/30 rounded-tr-2xl pointer-events-none z-10" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-gold/30 rounded-bl-2xl pointer-events-none z-10" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-gold/30 rounded-br-2xl pointer-events-none z-10" />

            {/* Header */}
            <div className="p-5 md:p-7 flex justify-between items-start border-b border-white/10 bg-[#121216] shrink-0">
              <div>
                <h3 className="text-base md:text-lg font-light text-white">
                  {editingProduct ? 'Edit Watch Specifications' : 'Register New Watch Listing'}
                </h3>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase">
                  {editingProduct ? `Modifying Catalog Watch ID: ${editingProduct.id}` : 'Fill in the replica spec card details'}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-white font-mono text-xs cursor-pointer border border-white/10 hover:border-white/30 px-2.5 py-1 rounded-lg transition-all"
              >
                CLOSE [ESC]
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 md:p-8 custom-scrollbar">
              <form onSubmit={handleProductSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Submariner 126610LN Date"
                    className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Brand</label>
                    <input
                      type="text"
                      required
                      list="admin-brands-list"
                      placeholder="e.g. Rolex / Patek Philippe"
                      value={productForm.brand}
                      onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                    />
                    <datalist id="admin-brands-list">
                      {availableBrands.map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Category</label>
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/[0.03] border border-white/10 p-1">
                      {(['Mens', 'Womens'] as const).map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            setProductForm(prev => ({ ...prev, audience: category }))
                            toast.info(`Audience Set: ${category}`, {
                              description: `Watch categorized under ${category}'s luxury collection.`
                            })
                          }}
                          className={`px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-300 ${
                            productForm.audience === category
                              ? 'bg-gold text-black shadow-md shadow-gold/10'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {category.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Edition / Maker</label>
                    <input
                      type="text"
                      placeholder="e.g. Clean Factory V3"
                      value={productForm.factory}
                      onChange={(e) => setProductForm(prev => ({ ...prev, factory: e.target.value }))}
                      className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Price (USD)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. $1,490.00"
                      value={productForm.priceUSD}
                      onChange={(e) => setProductForm(prev => ({ ...prev, priceUSD: e.target.value }))}
                      className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Price (AED)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AED 5,468"
                      value={productForm.priceAED}
                      onChange={(e) => setProductForm(prev => ({ ...prev, priceAED: e.target.value }))}
                      className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                    />
                  </div>
                </div>

                {/* Watch Photos & Gallery Manager */}
                <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5 font-mono sm:col-span-2">
                  <div>
                    <h4 className="text-gold uppercase tracking-wider text-xs font-bold flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" /> Watch Photos & Gallery Manager
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                      Manage all photos for this watch. The photo marked as <span className="text-gold font-bold">Main Cover</span> will be the primary catalog cover image & hero banner. Other photos will appear in the slider on the watch detail page.
                    </p>
                  </div>

                  {/* Grid / List of Images */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {(productForm.images || []).map((imgUrl, index) => {
                      const isMain = productForm.image === imgUrl;
                      return (
                        <div 
                          key={index}
                          className={`flex items-center gap-3 p-3 bg-black/40 border rounded-xl transition-all duration-300 group ${
                            isMain ? 'border-gold/60 shadow-[0_0_15px_rgba(217,165,32,0.15)] bg-gold/[0.03]' : 'border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div 
                            onClick={() => {
                              if (!isMain) {
                                setProductForm(prev => ({ ...prev, image: imgUrl }));
                                toast.success('Main Cover Image Set', {
                                  description: `Photo #${index + 1} is now set as the primary watch banner & catalog cover.`
                                });
                              }
                            }}
                            className={`w-16 h-16 bg-black border rounded-lg p-1 flex items-center justify-center shrink-0 overflow-hidden relative cursor-pointer ${
                              isMain ? 'border-gold/50' : 'border-white/10 hover:border-gold/40'
                            }`}
                            title={isMain ? 'Currently Main Cover' : 'Click to set as Main Cover'}
                          >
                            <img src={imgUrl} className="max-h-full max-w-full object-contain" alt={`Photo ${index + 1}`} />
                            {!isMain && (
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[7px] text-gold font-bold uppercase transition-opacity duration-200 text-center px-1">
                                SET MAIN
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded font-bold uppercase">
                                #{index + 1}
                              </span>
                              {isMain ? (
                                <span className="text-[9px] bg-gold/25 text-gold border border-gold/45 px-1.5 py-0.5 rounded font-black tracking-wider uppercase animate-pulse flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5" /> Main Cover
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProductForm(prev => ({ ...prev, image: imgUrl }));
                                    toast.success('Main Cover Image Set', {
                                      description: `Photo #${index + 1} is now set as the primary watch banner & catalog cover.`
                                    });
                                  }}
                                  className="text-[9px] text-gray-400 hover:text-gold border border-white/10 hover:border-gold/40 hover:bg-gold/10 px-2 py-0.5 rounded transition-all duration-200 uppercase font-semibold"
                                >
                                  Make Main
                                </button>
                              )}
                            </div>
                            <span className="text-[9px] text-gray-500 truncate mt-1.5 block font-mono" title={imgUrl}>
                              {imgUrl}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(imgUrl);
                                toast.success('URL Copied', {
                                  description: 'Photo URL copied to clipboard.'
                                });
                              }}
                              className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-all duration-200"
                              title="Copy Image URL"
                            >
                              <Copy size={14} />
                            </button>

                            <button 
                              type="button"
                              onClick={() => {
                                setProductForm(prev => {
                                  const newImages = (prev.images || []).filter((_, i) => i !== index);
                                  let nextMain = prev.image;
                                  if (prev.image === imgUrl) {
                                    nextMain = newImages[0] || '';
                                  }
                                  return {
                                    ...prev,
                                    images: newImages,
                                    image: nextMain
                                  };
                                });
                                toast.info('Photo Removed', {
                                  description: `Photo #${index + 1} removed from watch gallery.`
                                });
                              }}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                              title="Remove Photo"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Auto Sync State */}
                    {productForm.image && !(productForm.images || []).includes(productForm.image) && (
                      <div 
                        className="flex items-center gap-3 p-3 bg-black/40 border border-gold/50 shadow-[0_0_15px_rgba(217,165,32,0.1)] rounded-xl transition-all duration-300"
                      >
                        <div className="w-16 h-16 bg-black border border-white/10 rounded-lg p-1 flex items-center justify-center shrink-0 overflow-hidden relative group/item">
                          <img src={productForm.image} className="max-h-full max-w-full object-contain" alt="Main Cover" />
                        </div>
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-gold/25 text-gold border border-gold/45 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
                              Main Cover
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setProductForm(prev => ({ ...prev, images: [...(prev.images || []), prev.image] }));
                                toast.success('Added to Gallery', {
                                  description: 'Main cover image added to watch gallery slider.'
                                });
                              }}
                              className="text-[9px] text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 rounded transition-all duration-200 uppercase font-semibold"
                            >
                              Add to Gallery
                            </button>
                          </div>
                          <span className="text-[9px] text-gray-500 truncate mt-1.5 block font-mono">
                            {productForm.image}
                          </span>
                        </div>
                      </div>
                    )}

                    {(productForm.images || []).length === 0 && !productForm.image && (
                      <div className="sm:col-span-2 py-6 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.005]">
                        <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-[11px] text-gray-500 italic">No watch photos uploaded yet. Upload a main photo or paste image links below.</p>
                      </div>
                    )}
                  </div>

                  {/* Inputs for adding new images */}
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <label className="text-[10px] text-gray-300 font-bold block mb-2 uppercase">
                      Add New Photo to Gallery
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          placeholder="Paste image URL (Cloudinary or web link) & press Enter..."
                          id="newGalleryImageUrlInput"
                          className="flex-1 px-4 py-3 text-xs rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const target = e.currentTarget;
                              const val = target.value.trim();
                              if (!val) {
                                toast.error('Image URL Required', { description: 'Please enter an image link.' });
                                return;
                              }
                              if ((productForm.images || []).includes(val)) {
                                toast.warning('Already in Gallery', { description: 'This image URL is already added.' });
                                return;
                              }
                              setProductForm(prev => {
                                const currentImages = prev.images || [];
                                const nextMain = prev.image || val;
                                return { 
                                  ...prev, 
                                  images: [...currentImages, val],
                                  image: nextMain
                                };
                              });
                              toast.success('Photo Added to Gallery', {
                                description: 'New photo successfully linked to watch specifications.'
                              });
                              target.value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const inputEl = document.getElementById('newGalleryImageUrlInput') as HTMLInputElement;
                            if (inputEl) {
                              const val = inputEl.value.trim();
                              if (!val) {
                                toast.error('Image URL Required', { description: 'Please enter an image link.' });
                                return;
                              }
                              if ((productForm.images || []).includes(val)) {
                                toast.warning('Already in Gallery', { description: 'This image URL is already added.' });
                                return;
                              }
                              setProductForm(prev => {
                                const currentImages = prev.images || [];
                                const nextMain = prev.image || val;
                                return { 
                                  ...prev, 
                                  images: [...currentImages, val],
                                  image: nextMain
                                };
                              });
                              toast.success('Photo Added to Gallery', {
                                description: 'New photo successfully linked to watch specifications.'
                              });
                              inputEl.value = '';
                            }
                          }}
                          className="px-5 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer"
                        >
                          ADD
                        </button>
                      </div>

                      <label className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shrink-0 select-none">
                        {galleryUploadLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gold" />
                        ) : (
                          <Upload className="w-4 h-4 text-gold" />
                        )}
                        <span>UPLOAD NEW PHOTO</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleGalleryPhotoUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Movement Spec</label>
                  <input
                    type="text"
                    required
                    value={productForm.movement}
                    onChange={(e) => setProductForm(prev => ({ ...prev, movement: e.target.value }))}
                    placeholder="e.g. Clone Caliber movement custom-engineered for 1:1 Rolex sweeps"
                    className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Casing Material Spec</label>
                  <input
                    type="text"
                    required
                    value={productForm.casing}
                    onChange={(e) => setProductForm(prev => ({ ...prev, casing: e.target.value }))}
                    placeholder="e.g. 904L anti-corrosive stainless steel casing"
                    className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Bezel Spec</label>
                  <input
                    type="text"
                    required
                    value={productForm.bezel}
                    onChange={(e) => setProductForm(prev => ({ ...prev, bezel: e.target.value }))}
                    placeholder="e.g. Hand-finished structural bezel with genuine texture luster"
                    className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Glass Crystal Spec</label>
                  <input
                    type="text"
                    required
                    value={productForm.glass}
                    onChange={(e) => setProductForm(prev => ({ ...prev, glass: e.target.value }))}
                    placeholder="e.g. Ultra-clear sapphire glass with anti-scratch and anti-glare finish"
                    className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Water Resistance Spec</label>
                  <input
                    type="text"
                    required
                    value={productForm.waterResistance}
                    onChange={(e) => setProductForm(prev => ({ ...prev, waterResistance: e.target.value }))}
                    placeholder="e.g. 50m waterproof vacuum tested"
                    className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Model / Series</label>
                  <input
                    type="text"
                    list="admin-models-list"
                    value={productForm.model || ''}
                    onChange={(e) => setProductForm(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="e.g. Daytona 116500LN"
                    className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                  />
                  <datalist id="admin-models-list">
                    {(availableBrandModels[productForm.brand.trim()] || []).map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Reference Number</label>
                  <input
                    type="text"
                    value={productForm.reference || ''}
                    onChange={(e) => setProductForm(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="e.g. Ref 116500LN"
                    className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Material Composition</label>
                  <input
                    type="text"
                    value={productForm.material || ''}
                    onChange={(e) => setProductForm(prev => ({ ...prev, material: e.target.value }))}
                    placeholder="e.g. 904L Oystersteel / Solid 18k Rose Gold"
                    className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Diameter Size</label>
                  <input
                    type="text"
                    value={productForm.size || ''}
                    onChange={(e) => setProductForm(prev => ({ ...prev, size: e.target.value }))}
                    placeholder="e.g. 40mm"
                    className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Engine Caliber</label>
                  <input
                    type="text"
                    value={productForm.caliber || ''}
                    onChange={(e) => setProductForm(prev => ({ ...prev, caliber: e.target.value }))}
                    placeholder="e.g. Rolex Caliber 4130 Super Clone"
                    className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Warranty Term</label>
                  <input
                    type="text"
                    value={productForm.warranty || '2-Year Service Warranty'}
                    onChange={(e) => setProductForm(prev => ({ ...prev, warranty: e.target.value }))}
                    placeholder="e.g. 2-Year Service Warranty"
                    className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Source Link / URL</label>
                  <input
                    type="text"
                    value={productForm.url || ''}
                    onChange={(e) => setProductForm(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="e.g. https://dubaiwatchstores.com/product/..."
                    className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white"
                  />
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Availability status</label>
                  <label className="flex items-center gap-3.5 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg cursor-pointer select-none hover:border-gold/20">
                    <input
                      type="checkbox"
                      checked={productForm.inStock}
                      onChange={(e) => setProductForm(prev => ({ ...prev, inStock: e.target.checked }))}
                      className="accent-gold w-4 h-4 text-gold"
                    />
                    <span className="text-[10px] text-white font-mono">MARK AS IN STOCK FOR SALE</span>
                  </label>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Storefront visibility</label>
                  <label className="flex items-center gap-3.5 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg cursor-pointer select-none hover:border-gold/20">
                    <input
                      type="checkbox"
                      checked={productForm.isVisible !== false}
                      onChange={(e) => setProductForm(prev => ({ ...prev, isVisible: e.target.checked }))}
                      className="accent-gold w-4 h-4 text-gold"
                    />
                    <span className="text-[10px] text-white font-mono">SHOW THIS WATCH ON THE STOREFRONT</span>
                  </label>
                  <p className="text-[9px] leading-4 text-gray-500">
                    Hidden watches remain in the admin catalogue but disappear from public pages.
                  </p>
                </div>

              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-bold font-mono uppercase tracking-wider mb-1">Catalogue Description</label>
                <textarea required rows={6}
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white resize-y"
                />
              </div>

              {/* Tag bubble features list */}
              <div className="space-y-2 p-4 rounded-xl bg-white/[0.01] border border-white/5 font-mono">
                <label className="text-gold uppercase tracking-wider text-[9px] font-bold block">
                  Product Replica Feature Tags (Add specs like Swiss Clasp)
                </label>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {productForm.features.map((feature, index) => (
                    <span 
                      key={index}
                      className="px-2.5 py-1 bg-gold/10 border border-gold/20 text-gold rounded-full text-[10px] flex items-center gap-1.5 font-mono"
                    >
                      {feature}
                      <button 
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-gray-400 hover:text-red-400 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {productForm.features.length === 0 && (
                    <span className="text-[10px] text-gray-500 italic font-mono">No custom tags added.</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addFeature()
                      }
                    }}
                    placeholder="Type spec tag and press enter..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-gold/20 focus:border-gold focus:outline-none transition-all duration-300 font-mono text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-1.5 bg-white/5 border border-white/10 hover:border-gold text-white text-xs font-mono rounded-lg transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer shrink-0 select-none"
                  >
                    ADD
                  </button>
                </div>
              </div>

                {/* Action Buttons inside scroll area */}
                <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3 pb-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-xs font-mono text-white transition-all duration-300 cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={productLoading}
                    className="px-6 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-mono font-bold tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/10"
                  >
                    {productLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        SAVING DETAILS...
                      </>
                    ) : (
                      'SAVE WATCH SPECIFICATIONS'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm p-4 flex items-center justify-center" data-lenis-prevent>
          <div className="relative w-full max-w-md bg-[#0e0e11] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl mx-auto font-mono text-xs text-white">
            {/* Corner styling borders */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-red-500/30 rounded-tl-2xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-red-500/30 rounded-tr-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-red-500/30 rounded-bl-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-red-500/30 rounded-br-2xl pointer-events-none" />

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <Trash2 className="w-6 h-6" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Confirm Watch Deletion</h3>
                <p className="text-gray-400 mt-2">
                  Are you sure you want to delete <span className="text-gold font-bold">{watchToDelete?.name || 'this watch'}</span>?
                </p>
                <p className="text-[10px] text-red-400 uppercase mt-2">
                  This action is irreversible and will delete the watch from the catalogue.
                </p>
              </div>

              <div className="flex gap-3 w-full pt-4">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all duration-300 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(deleteConfirmId)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all duration-300 cursor-pointer shadow-lg shadow-red-900/30"
                >
                  DELETE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACCESSORY ADD / EDIT MODAL */}
      {isAccessoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center" data-lenis-prevent>
          <div className="relative w-full max-w-2xl bg-[#0e0e11] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl my-8 mx-auto font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-light text-white">
                  {editingAccessory ? 'Edit Luxury Accessory' : 'Add New Luxury Accessory'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  STRAP, PRESENTATION BOX, OR WATCH WINDER
                </p>
              </div>
              <button
                onClick={() => setIsAccessoryModalOpen(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccessory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Accessory Name *</label>
                  <input
                    type="text"
                    required
                    value={accessoryForm.name}
                    onChange={(e) => setAccessoryForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Rolex Green Wave Luxury Box Set"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Category *</label>
                  <select
                    value={accessoryForm.category}
                    onChange={(e) => setAccessoryForm((prev) => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none text-white"
                  >
                    <option value="Straps">Straps (Leather / Rubber / Composite)</option>
                    <option value="Boxes">Boxes (Presentation Sets)</option>
                    <option value="Accessories">Accessories (General / Care)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Brand Compatibility</label>
                  <input
                    type="text"
                    value={accessoryForm.brandCompatibility}
                    onChange={(e) => setAccessoryForm((prev) => ({ ...prev, brandCompatibility: e.target.value }))}
                    placeholder="e.g. Rolex, Audemars Piguet, or Universal"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Material / Construction</label>
                  <input
                    type="text"
                    value={accessoryForm.material}
                    onChange={(e) => setAccessoryForm((prev) => ({ ...prev, material: e.target.value }))}
                    placeholder="e.g. Full-Grain Epsom Calfskin"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Price in AED *</label>
                  <input
                    type="text"
                    required
                    value={accessoryForm.priceAED}
                    onChange={(e) => {
                      const val = e.target.value
                      setAccessoryForm((prev) => {
                        const num = parseInt(val.replace(/[^0-9]/g, '') || '0')
                        const usd = num > 0 ? `$${Math.round(num / 3.67)}.00` : ''
                        return { ...prev, priceAED: val, priceUSD: usd || prev.priceUSD }
                      })
                    }}
                    placeholder="e.g. AED 850"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Price in USD</label>
                  <input
                    type="text"
                    value={accessoryForm.priceUSD}
                    onChange={(e) => setAccessoryForm((prev) => ({ ...prev, priceUSD: e.target.value }))}
                    placeholder="e.g. $230.00"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none text-white"
                  />
                </div>
              </div>

              {/* Image Input with Upload support */}
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Image URL / Upload *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={accessoryForm.image}
                    onChange={(e) => setAccessoryForm((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="https://images.unsplash.com/... or upload"
                    className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none text-white"
                  />
                  <label className="px-4 py-3 rounded-xl bg-white/5 hover:bg-gold/20 border border-white/10 hover:border-gold/40 text-gray-300 hover:text-gold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const toastId = toast.loading('Uploading accessory image...')
                        const formData = new FormData()
                        formData.append('image', file)
                        try {
                          const res = await fetch('/api/admin/upload', {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${token}` },
                            body: formData,
                          })
                          const data = await res.json()
                          if (res.ok && data.url) {
                            setAccessoryForm((prev) => ({ ...prev, image: data.url }))
                            toast.success('Image Uploaded', { id: toastId })
                          } else {
                            toast.error('Upload Failed', { id: toastId, description: data.error })
                          }
                        } catch (err: any) {
                          toast.error('Upload Error', { id: toastId, description: err.message })
                        }
                      }}
                    />
                  </label>
                </div>
                {accessoryForm.image && (
                  <div className="w-20 h-20 rounded-xl bg-black border border-white/10 p-1 flex items-center justify-center overflow-hidden">
                    <img src={accessoryForm.image} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">Description</label>
                <textarea
                  rows={3}
                  value={accessoryForm.description}
                  onChange={(e) => setAccessoryForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed specifications, clasp materials, compatibility..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 focus:border-gold focus:outline-none text-white resize-none"
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accessoryForm.inStock}
                    onChange={(e) => setAccessoryForm((prev) => ({ ...prev, inStock: e.target.checked }))}
                    className="accent-gold w-4 h-4"
                  />
                  <span className="text-xs text-white">MARK AS IN STOCK</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accessoryForm.isVisible}
                    onChange={(e) => setAccessoryForm((prev) => ({ ...prev, isVisible: e.target.checked }))}
                    className="accent-gold w-4 h-4"
                  />
                  <span className="text-xs text-white">SHOW ON STOREFRONT</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAccessoryModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all duration-300 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gold hover:bg-gold-light text-black font-bold rounded-xl transition-all duration-300 cursor-pointer shadow-lg shadow-gold/20"
                >
                  {editingAccessory ? 'UPDATE ACCESSORY' : 'CREATE ACCESSORY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACCESSORY DELETE CONFIRMATION MODAL */}
      {accessoryDeleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm p-4 flex items-center justify-center" data-lenis-prevent>
          <div className="relative w-full max-w-md bg-[#0e0e11] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl mx-auto font-mono text-xs text-white">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Confirm Accessory Deletion</h3>
                <p className="text-gray-400 mt-2">
                  Are you sure you want to delete this accessory?
                </p>
                <p className="text-[10px] text-red-400 uppercase mt-2">
                  This action is irreversible.
                </p>
              </div>
              <div className="flex gap-3 w-full pt-4">
                <button
                  type="button"
                  onClick={() => setAccessoryDeleteConfirmId(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all duration-300 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAccessory(accessoryDeleteConfirmId)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all duration-300 cursor-pointer shadow-lg shadow-red-900/30"
                >
                  DELETE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
