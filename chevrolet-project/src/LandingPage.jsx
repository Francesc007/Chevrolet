import { useState, useEffect } from 'react'
import { fetchCars, fetchReviews } from './lib/carApi'
import {
  insertLandingInteraction,
  carIdFromLabel,
  sanitizeCarId,
} from './lib/trackInteraction'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Phone, 
  Mail, 
  Clock, 
  Award, 
  Zap, 
  Shield, 
  Star,
  ChevronRight,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react'

const WA_PHONE = '529511931268'

const waHrefForCar = (nombre) =>
  `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(
    `Hola Carlos Hernández, me interesa el ${nombre}.`,
  )}`

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentModel, setCurrentModel] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [formData, setFormData] = useState({
    nombre: '',
    whatsapp: '',
    modelo: ''
  })
  const [cars, setCars] = useState([])
  const [testimoniosApi, setTestimoniosApi] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTestimonioIndex, setCurrentTestimonioIndex] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsData, reviewsData] = await Promise.all([
          fetchCars(),
          fetchReviews(),
        ])

        console.log('Cars from API:', carsData)
        console.log('Reviews from API:', reviewsData)

        setCars(carsData)
        setTestimoniosApi(reviewsData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const modelos = cars.filter(car => car.EsNuevo).map(car => ({
    id: car.id,
    carId: car.id,
    nombre: `${car.Marca} ${car.Modelo}`,
    imagen: car.imagenes[0] || '',
    imagenes: car.imagenes.length ? car.imagenes : [],
    aceleracion: car.Aceleracion || 'N/D',
    potencia: car.Potencia,
    motor: car.Motor || 'N/D',
    descuento: car.Descuento,
    precioRaw: car.Precio,
    precio: car.Precio ? `$${car.Precio.toLocaleString()}` : 'Consultar',
    precioConDescuento:
      car.Precio && car.Descuento > 0
        ? `$${(car.Precio * (1 - car.Descuento / 100)).toLocaleString()}`
        : null
  }))

  const seminuevos = cars.filter(car => !car.EsNuevo).map(car => ({
    id: car.id,
    carId: car.id,
    nombre: `${car.Marca} ${car.Modelo}`,
    año: car.Anio?.toString() || 'N/D',
    imagen: car.imagenes[0] || '',
    imagenes: car.imagenes.length ? car.imagenes : [],
    kilometraje: car.Kilometraje
      ? `${Number(car.Kilometraje).toLocaleString()} km`
      : '0 km',
    precioRaw: car.Precio,
    precio: car.Precio ? `$${car.Precio.toLocaleString()}` : 'Consultar',
    precioConDescuento:
      car.Precio && car.Descuento > 0
        ? `$${(car.Precio * (1 - car.Descuento / 100)).toLocaleString()}`
        : null,
    motor: car.Motor || 'N/D',
    descuento: car.Descuento,
    aceleracion: car.Aceleracion || 'N/D',
    potencia: car.Potencia
  }))

  const testimonios = testimoniosApi

  useEffect(() => {
    setCurrentTestimonioIndex(0)
  }, [testimoniosApi.length])

  // Efecto para el carrusel de testimonios (6 segundos)
  useEffect(() => {
    if (testimonios.length > 1) {
      const interval = setInterval(() => {
        setCurrentTestimonioIndex((prev) => (prev + 1) % testimonios.length)
      }, 6000)
      return () => clearInterval(interval)
    }
  }, [testimonios.length])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const openModal = (modelo) => {
    setCurrentModel(modelo)
    setCurrentImageIndex(0)
    setModalOpen(true)
    document.body.style.overflow = 'hidden' // Prevenir scroll del body
  }

  const closeModal = () => {
    setModalOpen(false)
    setCurrentModel(null)
    setCurrentImageIndex(0)
    document.body.style.overflow = 'unset'
  }

  const nextImage = () => {
    if (currentModel && currentImageIndex < currentModel.imagenes.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  // Navegación con teclado (Escape, flechas izquierda/derecha)
  useEffect(() => {
    if (!modalOpen) return

    const handleKeyboard = (e) => {
      switch(e.key) {
        case 'Escape':
          setModalOpen(false)
          setCurrentModel(null)
          setCurrentImageIndex(0)
          document.body.style.overflow = 'unset'
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1)
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (currentModel && currentImageIndex < currentModel.imagenes.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1)
          }
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [modalOpen, currentImageIndex, currentModel])

  /** Bloques sueltos: entrar al viewport sin quedarse en opacity 0 */
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: 0.8, ease: 'easeOut' },
  }

  /** Grid con hijos: patrón hidden/show + stagger (whileInView en hijos fallaba con un solo ítem) */
  const staggerParent = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.15 },
    },
  }

  const staggerItem = {
    hidden: { opacity: 0, y: 60 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  const servicios = [
    {
      icon: <Shield className="w-8 h-8" />,
      titulo: "Entrega VIP a Domicilio",
      descripcion: "Tu nuevo Chevrolet, Buick o GMC llega a tu puerta en todo Oaxaca."
    },
    {
      icon: <Award className="w-8 h-8" />,
      titulo: "Gestión Premium de Trámites",
      descripcion: "Olvídate del papeleo. Yo me encargo de placas, seguros y toda la documentación."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      titulo: "Atención 24/7 Personalizada",
      descripcion: "Disponible cuando me necesites. Tu satisfacción es mi compromiso de por vida."
    }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    const carId = carIdFromLabel(cars, formData.modelo)
    console.log('ID del auto seleccionado:', carId)
    const label = formData.modelo?.trim() || null
    await insertLandingInteraction({
      type: 'submit_lead',
      car_id: carId,
      metadata: {
        nombre: formData.nombre,
        whatsapp: formData.whatsapp,
        modelo_interes: label,
        car_label: label,
        source: 'formulario_contacto',
      },
    })

    const mensaje = `Hola Carlos Hernández, soy ${formData.nombre}. Estoy interesado en el ${formData.modelo}. Mi WhatsApp: ${formData.whatsapp}`
    const whatsappUrl = `https://wa.me/529511931268?text=${encodeURIComponent(mensaje)}`
    window.open(whatsappUrl, '_blank')

    setFormData({
      nombre: '',
      whatsapp: '',
      modelo: ''
    })
  }

  /** `mappedCar`: objeto del .map() (modelos / seminuevos / modal) con `id` UUID de la API. */
  const trackWhatsAppClick = (mappedCar) => {
    const carId = sanitizeCarId(mappedCar?.id ?? mappedCar?.carId)
    console.log('ID del auto seleccionado:', carId)
    if (!carId) {
      console.error('¡CUIDADO! Intentando enviar un track sin ID de auto')
      return
    }
    void insertLandingInteraction({
      type: 'click_whatsapp',
      car_id: carId,
      metadata: {
        source: 'whatsapp',
        car_label: mappedCar?.nombre ?? null,
      },
    })
  }

  return (
    <div className="bg-white text-gray-900">
      {loading && (
        <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-gmcRed border-t-transparent rounded-full"
          />
        </div>
      )}
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-sm border-b border-gray-200/20 border-t-2 border-t-gmcRed"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center gap-4">
              <button 
                onClick={scrollToTop}
                className="flex flex-col items-start cursor-pointer group"
              >
                <span className="font-brand text-2xl md:text-3xl font-black tracking-tighter text-gmcRed group-hover:drop-shadow-[0_0_10px_rgba(155,27,27,0.5)] transition-all leading-none">
                  Carlos Hernández
                </span>
                <span className="font-sans text-[13px] md:text-[15px] font-bold text-gray-400 uppercase tracking-[0.2em] group-hover:text-gmcRed transition-colors mt-1">
                  Chevrolet | Buick | GMC
                </span>
              </button>
              
              {/* GM Logos - Desktop only or better spaced */}
              <div className="hidden sm:flex items-center gap-3 md:gap-4 border-l border-gray-200 pl-4 h-12">
                <img src="/Chevrolet/Chevrolet-Logo.png" alt="Chevrolet" className="h-6 md:h-8 object-contain" />
                <img src="/Chevrolet/Buick-Logo.png" alt="Buick" className="h-6 md:h-8 object-contain" />
                <img src="/Chevrolet/GMC-logo.png" alt="GMC" className="h-6 md:h-8 object-contain" />
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#modelos" className="text-lg font-medium hover:text-gmcRed transition-colors">Modelos</a>
              <a href="#servicios" className="text-lg font-medium hover:text-gmcRed transition-colors">Servicios</a>
              <a href="#contacto" className="text-lg font-medium hover:text-gmcRed transition-colors">Contacto</a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="md:hidden pb-4"
            >
          <div className="flex flex-col space-y-4 text-lg">
                <a href="#modelos" onClick={() => setIsMenuOpen(false)} className="hover:text-gmcRed transition-colors">Modelos</a>
                <a href="#servicios" onClick={() => setIsMenuOpen(false)} className="hover:text-gmcRed transition-colors">Servicios</a>
                <a href="#contacto" onClick={() => setIsMenuOpen(false)} className="hover:text-gmcRed transition-colors">Contacto</a>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/Chevrolet/Camaro-H1.jpg" 
            alt="Chevrolet Camaro Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            whileHover={{ 
              scale: 1.05,
              y: -8,
              textShadow: "0 0 30px rgba(155, 27, 27, 0.8), 0 0 60px rgba(255, 255, 255, 0.4)",
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            className="font-brand text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight cursor-pointer text-white tracking-tighter"
          >
            Carlos <span className="text-gmcRed">Hernández</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="font-sans text-2xl sm:text-3xl md:text-4xl text-gmcRed mb-4 font-bold"
          >
            Alianza Chevrolet, Buick y <span className="text-gmcRed">GMC</span>
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-lg sm:text-xl text-white mb-12 font-bold bg-black/40 backdrop-blur-md inline-block px-6 py-3 rounded-xl border border-white/10 shadow-lg"
          >
            La innovación automotriz en el <span className="text-gmcRed underline decoration-2 underline-offset-4">Itsmo</span>
          </motion.p>
          <motion.a
            href="#modelos"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="inline-flex items-center gap-2 bg-gmcRed text-white px-8 py-4 rounded-full text-lg hover:bg-red-700 shadow-xl transition-all group font-bold"
          >
            Modelos Exclusivos
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* El Estándar Carlos Hernández */}
      <section id="servicios" className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-brand text-4xl sm:text-5xl md:text-6xl font-black mb-4 text-gray-900 tracking-tighter">
              El Estándar Carlos <span className="text-gmcRed">Hernández</span>
            </h2>
            <p className="text-gmcRed text-xl max-w-2xl mx-auto font-bold">
              Un servicio de concierge privado que redefine la innovación en movilidad
            </p>
          </motion.div>

          <motion.div 
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.12 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {servicios.map((servicio, index) => {
              // Diferentes estilos para cada cuadro usando los colores de la marca
              const estilos = [
                // Cuadro 1: Borde rojo con fondo claro
                "bg-white border-2 border-gmcRed/10 hover:border-gmcRed shadow-sm",
                // Cuadro 2: Fondo claro con borde dorado elegante
                "bg-white border-2 border-chevroletGold/10 hover:border-chevroletGold shadow-sm",
                // Cuadro 3: Combinación con acento rojo GMC
                "bg-white border-2 border-gmcRed/10 hover:border-gmcRed shadow-sm"
              ]
              
              return (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className={`${estilos[index % 3]} p-8 rounded-2xl transition-all duration-300 group`}
                >
                  <div className="text-gmcRed mb-6 group-hover:scale-110 transition-transform">
                    {servicio.icon}
                  </div>
                  <h3 className="font-sans text-2xl font-bold mb-4 text-gray-900">{servicio.titulo}</h3>
                  <p className="text-gray-600 group-hover:text-gray-900 leading-relaxed">{servicio.descripcion}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Mi Selección Exclusiva */}
      <section id="modelos" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-brand text-4xl sm:text-5xl md:text-6xl font-black mb-4 text-gray-900 tracking-tighter">
              Mi Selección Exclusiva
            </h2>
            <p className="text-gmcRed text-xl max-w-2xl mx-auto font-bold">
              Modelos curados personalmente para el conductor más exigente
            </p>
          </motion.div>

          <motion.div 
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.12 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {modelos.map((modelo, index) => (
              <motion.div
                key={modelo.id || `modelo-${index}`}
                variants={staggerItem}
                className="bg-gray-50 rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                <div 
                  className="relative h-64 overflow-hidden cursor-pointer"
                  onClick={() => openModal(modelo)}
                >
                  <img 
                    src={modelo.imagen} 
                    alt={modelo.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Badge de Descuento Dinámico */}
                  {modelo.descuento > 0 && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="relative">
                        <div 
                          className="bg-gmcRed px-2 py-1 rounded-md border border-white/20 shadow-xl"
                        >
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white text-white animate-pulse" />
                            <div className="text-center leading-none">
                              <p className="text-white font-black text-sm">-{modelo.descuento}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-sans text-2xl font-bold mb-6 text-gray-900">{modelo.nombre}</h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <Zap className="w-5 h-5 text-gmcRed mx-auto mb-2" />
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">0-100</p>
                      <p className="font-bold text-gray-900">{modelo.aceleracion}</p>
                    </div>
                    <div className="text-center">
                      <Award className="w-5 h-5 text-gmcRed mx-auto mb-2" />
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Potencia</p>
                      <p className="font-bold text-gray-900">
                        {modelo.potencia != null ? `${modelo.potencia} HP` : 'N/D'}
                      </p>
                    </div>
                    <div className="text-center">
                      <Shield className="w-5 h-5 text-gmcRed mx-auto mb-2" />
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Motor</p>
                      <p className="font-bold text-gray-900">{modelo.motor}</p>
                    </div>
                  </div>

                  {/* Precio Dinámico */}
                  <div className="mb-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-medium">Inversión</span>
                    <div className="text-right">
                      {modelo.descuento > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-gray-400 text-xs line-through">
                            {modelo.precio}
                          </span>
                          <span className="font-bold text-gray-900 text-xl">
                            {modelo.precioConDescuento}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-gray-900 text-lg">
                          {modelo.precio}
                        </span>
                      )}
                    </div>
                  </div>

                  <a
                    href={waHrefForCar(modelo.nombre)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick(modelo)}
                    className="w-full block text-center bg-gmcRed text-white py-3 rounded-lg hover:bg-red-900 transition-colors font-bold shadow-lg"
                  >
                    WhatsApp
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Seminuevos Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-brand text-4xl sm:text-5xl md:text-6xl font-black mb-4 text-gray-900 tracking-tighter">
              Seminuevos Certificados
            </h2>
            <p className="text-gmcRed text-xl max-w-2xl mx-auto font-bold">
              Vehículos premium con la garantía y el servicio Carlos Hernández
            </p>
          </motion.div>

          <motion.div 
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.12 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {seminuevos.map((vehiculo, index) => (
              <motion.div
                key={vehiculo.nombre ? `${vehiculo.nombre}-${index}` : index}
                variants={staggerItem}
                className="bg-white rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                <div 
                  className="relative h-64 overflow-hidden cursor-pointer"
                  onClick={() => openModal(vehiculo)}
                >
                  <img 
                    src={vehiculo.imagen} 
                    alt={vehiculo.nombre}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 bg-gray-100"
                  />
                  
                  {/* Badge de Descuento Dinámico */}
                  {vehiculo.descuento > 0 && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="relative">
                        <div 
                          className="bg-gmcRed px-2 py-1 rounded-md border border-white/20 shadow-xl"
                        >
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white text-white animate-pulse" />
                            <div className="text-center leading-none">
                              <p className="text-white font-black text-sm">-{vehiculo.descuento}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-sans text-2xl font-bold mb-6 text-gray-900">{vehiculo.nombre}</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Año</span>
                      <span className="font-bold text-gray-900">{vehiculo.año}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Kilometraje</span>
                      <span className="font-bold text-gray-900">{vehiculo.kilometraje}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Motor</span>
                      <span className="font-bold text-gray-900">{vehiculo.motor}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-500 font-medium">Precio</span>
                      <div className="text-right">
                        {vehiculo.descuento > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-gray-400 text-sm line-through">
                              {vehiculo.precio}
                            </span>
                            <span className="font-bold text-gmcRed text-xl">
                              {vehiculo.precioConDescuento}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-gmcRed text-lg">
                            {vehiculo.precio}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <a
                    href={waHrefForCar(vehiculo.nombre)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick(vehiculo)}
                    className="w-full block text-center bg-gray-900 text-white py-3 rounded-lg hover:bg-black transition-colors font-bold shadow-lg"
                  >
                    WhatsApp
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            {...fadeInUp}
            className="mt-12 text-center"
          >
            <p className="text-gray-600 mb-6 font-medium">
              ¿Buscas un modelo específico? Contáctame para acceder a mi inventario exclusivo
            </p>
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-full hover:bg-gray-900 hover:text-white transition-all group font-bold"
            >
              Ver Más Seminuevos
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-brand text-4xl sm:text-5xl md:text-6xl font-black mb-4 text-gray-900 tracking-tighter">
              Experiencias Reales
            </h2>
            <p className="text-gmcRed text-xl font-bold">
              Testimonios de clientes que confiaron en el estándar Carlos <span className="text-gmcRed">Hernández</span>
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {testimonios.length > 0 && (
                <motion.div
                  key={
                    testimonios[currentTestimonioIndex]?.id ??
                    currentTestimonioIndex
                  }
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className={`${[
                    "bg-gray-50 border-2 border-gmcRed/10",
                    "bg-gray-50 border-2 border-chevroletGold/10",
                    "bg-gray-50 border-2 border-gmcRed/10"
                  ][currentTestimonioIndex % 3]} p-8 md:p-12 rounded-2xl shadow-xl`}
                >
                  <div className="flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
                    {/* Izquierda: Foto del usuario */}
                    <div className="flex-shrink-0">
                      {testimonios[currentTestimonioIndex].imagen ? (
                        <img 
                          src={testimonios[currentTestimonioIndex].imagen} 
                          alt={testimonios[currentTestimonioIndex].nombre}
                          referrerPolicy="no-referrer"
                          className="w-[250px] h-[250px] rounded-2xl object-cover border-4 border-white shadow-lg bg-gray-200"
                        />
                      ) : (
                        <div className="w-[250px] h-[250px] rounded-2xl bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-2xl flex-shrink-0 border-4 border-white shadow-lg">
                          {testimonios[currentTestimonioIndex].nombre.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Derecha: Contenido y Divisiones */}
                    <div className="flex-1 flex flex-col h-full">
                      <div className="flex gap-1 mb-6 justify-center md:justify-start">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className="w-5 h-5 fill-chevroletGold text-chevroletGold"
                          />
                        ))}
                      </div>
                      
                      <p className="text-xl md:text-2xl text-gray-700 mb-8 italic leading-relaxed font-medium">
                        &ldquo;{testimonios[currentTestimonioIndex].texto}&rdquo;
                      </p>
                      
                      <div className="mt-auto pt-6 border-t border-gray-200">
                        <p className="font-bold text-2xl text-gray-900 mb-1">
                          {testimonios[currentTestimonioIndex].nombre}
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                          <p className="text-gmcRed font-bold">
                            {testimonios[currentTestimonioIndex].ubicacion}
                          </p>
                          <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                          <p className="text-sm text-gray-600 font-bold bg-white inline-block px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
                            {testimonios[currentTestimonioIndex].modelo}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Indicadores (Dots) */}
            {testimonios.length > 1 && (
              <div className="flex justify-center gap-3 mt-10">
                {testimonios.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonioIndex(index)}
                    className={`h-1.5 transition-all duration-500 rounded-full ${
                      index === currentTestimonioIndex 
                        ? 'w-12 bg-gmcRed' 
                        : 'w-3 bg-gray-200 hover:bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp}>
              <h2 className="font-brand text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-gray-900 tracking-tighter">
                Agenda tu Cita <span className="text-gmcRed">Personalizada</span>
              </h2>
              <p className="text-gmcRed text-xl mb-8 leading-relaxed font-bold">
                Permíteme guiarte en la adquisición de tu próximo Chevrolet, Buick o GMC. 
                Una conversación privada sin compromisos para entender tus necesidades.
              </p>
              <div className="space-y-4">
                <a 
                  href="https://wa.me/529511931268?text=Hola%20Carlos%20Hernández,%20vi%20tu%20landing%20page%20y%20me%20gustaría%20recibir%20información."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 hover:text-gmcRed transition-colors font-bold text-gray-700"
                >
                  <Phone className="w-6 h-6 text-gmcRed" />
                  <span>+52 951 193 1268</span>
                </a>
                <div className="flex items-center gap-4 font-bold text-gray-700">
                  <Mail className="w-6 h-6 text-gmcRed" />
                  <span>carlos@chevrolet.com</span>
                </div>
                <div className="flex items-center gap-4 font-bold text-gray-700">
                  <Clock className="w-6 h-6 text-gmcRed" />
                  <span>Disponible 24/7 para ti</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              {...fadeInUp}
              className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-gmcRed transition-colors text-gray-900"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-gmcRed transition-colors text-gray-900"
                    placeholder="951 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Modelo de Interés</label>
                  <select
                    required
                    value={formData.modelo}
                    onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-gmcRed transition-colors text-gray-900"
                  >
                    <option value="">Selecciona un modelo</option>
                    {cars.map(car => (
                      <option key={car.id} value={`${car.Marca} ${car.Modelo}`}>
                        {car.Marca} {car.Modelo}
                      </option>
                    ))}
                    <option value="Otro modelo">Otro modelo</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gmcRed text-white font-black py-4 rounded-lg hover:bg-red-900 shadow-xl transition-all flex items-center justify-center gap-2 group uppercase tracking-widest"
                >
                  Agendar Cita Personalizada
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-brand text-2xl font-black mb-2 text-gray-900 tracking-tighter">Carlos Hernández</p>
          <p className="text-gmcRed font-bold mb-4">Asesor de venta Senior | Chevrolet, Buick y GMC</p>
          <p className="text-sm text-gray-400 font-medium">
            Todo Oaxaca | © {new Date().getFullYear()} Todos los derechos reservados. 
            Las marcas Chevrolet, Buick y GMC son propiedad de General Motors.
          </p>
        </div>
      </footer>

      {/* Modal Estilo Instagram */}
      <AnimatePresence>
        {modalOpen && currentModel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col"
            >
              {/* Botón Cerrar */}
              <button
                onClick={closeModal}
                className="absolute -top-12 right-0 text-white hover:text-gmcRed transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Contenedor de Imagen */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={currentModel.imagenes[currentImageIndex]}
                  alt={currentModel.nombre}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />

                {/* Botones de Navegación */}
                {currentModel.imagenes.length > 1 && (
                  <>
                    {/* Botón Anterior */}
                    {currentImageIndex > 0 && (
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                    )}

                    {/* Botón Siguiente */}
                    {currentImageIndex < currentModel.imagenes.length - 1 && (
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    )}

                {/* Indicadores de Posición / Thumbnails */}
                {currentModel.imagenes.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90%] px-4 py-2 scrollbar-hide">
                    {currentModel.imagenes.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden transition-all border-2 ${
                          idx === currentImageIndex 
                            ? 'border-white scale-110 z-10' 
                            : 'border-transparent opacity-50 hover:opacity-100'
                        }`}
                      >
                        <img src={img} className="w-full h-full object-cover" alt="" />
                      </button>
                    ))}
                  </div>
                )}
                  </>
                )}
              </div>

              {/* Información del Modelo */}
              <div className="mt-4 text-white">
                <h3 className="font-sans text-2xl md:text-3xl font-bold mb-2">
                  {currentModel.nombre}
                </h3>
                <div className="flex flex-wrap gap-4 text-sm md:text-base">
                  {currentModel.aceleracion &&
                    currentModel.aceleracion !== 'N/D' && (
                    <span className="text-chevroletGold font-bold">
                      0-100: {currentModel.aceleracion}
                    </span>
                  )}
                  {currentModel.potencia != null && (
                    <span className="text-chevroletGold font-bold">
                      {currentModel.potencia} HP
                    </span>
                  )}
                  {currentModel.motor && (
                    <span className="text-chevroletGold font-bold">
                      {currentModel.motor}
                    </span>
                  )}
                  {currentModel.año && (
                    <span className="text-chevroletGold font-bold">
                      Año: {currentModel.año}
                    </span>
                  )}
                  {currentModel.kilometraje && (
                    <span className="text-chevroletGold font-bold">
                      {currentModel.kilometraje}
                    </span>
                  )}
                </div>
                {currentModel.imagenes.length > 1 && (
                  <p className="text-gray-400 text-sm mt-2">
                    {currentImageIndex + 1} / {currentModel.imagenes.length}
                  </p>
                )}
                <a
                  href={waHrefForCar(currentModel.nombre)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick(currentModel)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gmcRed px-4 py-2.5 text-sm font-bold text-white hover:bg-red-800"
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp — rojo intenso + anillo con pulso */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          delay: 1,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        <motion.a
          href="https://wa.me/529511931268?text=Hola%20Carlos%20Hernández,%20vi%20tu%20landing%20page%20y%20me%20gustaría%20recibir%20información."
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center rounded-full p-4"
          style={{
            background:
              "linear-gradient(145deg, #dc2626 0%, #b91c1c 45%, #991b1b 100%)",
            border: "1px solid rgba(254, 202, 202, 0.4)",
            boxShadow:
              "0 8px 28px rgba(0,0,0,0.38), 0 0 24px rgba(220, 38, 38, 0.42)",
          }}
          whileHover={{
            scale: 1.12,
            boxShadow:
              "0 0 32px rgba(220, 38, 38, 0.8), 0 0 52px rgba(185, 28, 28, 0.5), 0 10px 28px rgba(0,0,0,0.4)",
            transition: { duration: 0.18 },
          }}
          whileTap={{ scale: 0.94, transition: { duration: 0.06 } }}
        >
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-red-400/45"
            animate={{
              scale: [1, 1.35, 1],
              opacity: [0.65, 0, 0.65],
            }}
            transition={{
              duration: 2.1,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.3,
            }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ boxShadow: "0 0 0 0 rgba(220, 38, 38, 0.55)" }}
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(220, 38, 38, 0.55)",
                "0 0 0 12px rgba(220, 38, 38, 0)",
                "0 0 0 0 rgba(220, 38, 38, 0)",
              ],
            }}
            transition={{
              duration: 2.1,
              repeat: Infinity,
              ease: "easeOut",
              repeatDelay: 0.3,
            }}
          />
          <Phone className="relative z-10 h-6 w-6 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.55)]" />
        </motion.a>
      </motion.div>

    </div>
  )
}

export default LandingPage
