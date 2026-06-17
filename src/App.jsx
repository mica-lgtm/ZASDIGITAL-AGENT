import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const products = [
    {
      name: "Jean Cordillera",
      url: "https://www.simonashop.com.ar/productos/jean-cordillera-1pnxy/",
      image: "https://via.placeholder.com/250x300/E07B2A/ffffff?text=Jean+Cordillera"
    },
    {
      name: "Camisa Vint Blanco",
      url: "https://www.simonashop.com.ar/productos/camisa-vint-blanco-1ku01/",
      image: "https://via.placeholder.com/250x300/E07B2A/ffffff?text=Camisa+Vint"
    },
    {
      name: "Buzo Argentina",
      url: "https://www.simonashop.com.ar/productos/buzo-argentina-vhhar/",
      image: "https://via.placeholder.com/250x300/E07B2A/ffffff?text=Buzo+Argentina"
    },
    {
      name: "Cardigan Barrica Gris",
      url: "https://www.simonashop.com.ar/productos/cardigan-barrica-gris-1dozd/",
      image: "https://via.placeholder.com/250x300/E07B2A/ffffff?text=Cardigan+Gris"
    }
  ]

  const benefits = [
    "12 cuotas sin interés en compras mayores a $100.000",
    "20% OFF con transferencia o depósito",
    "Envío gratis en compras mayores a $149.900",
    "Cambios fáciles hasta 15 días después de comprar"
  ]

  const quickLinks = [
    { label: "Novedades", url: "https://www.simonashop.com.ar/novedades" },
    { label: "Otoño-Invierno", url: "https://www.simonashop.com.ar/categoria/otono-invierno" },
    { label: "Básicos", url: "https://www.simonashop.com.ar/categoria/basicos" },
    { label: "Blazers", url: "https://www.simonashop.com.ar/categoria/blazers" },
    { label: "Denim", url: "https://www.simonashop.com.ar/categoria/denim" },
    { label: "Final Sale", url: "https://www.simonashop.com.ar/categoria/final-sale" }
  ]

  return (
    <div className="min-h-screen bg-cream text-dark">
      {/* 1. Header */}
      <header className="sticky top-0 z-50 bg-cream shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-orange">SIMONA</div>
          <div className="text-sm text-gray-700 hidden sm:block">Indumentaria que acompaña tu estilo cada día</div>
          <a href={import.meta.env.VITE_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white px-3 py-2 rounded text-sm font-semibold hover:opacity-90">
            WhatsApp
          </a>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 max-w-7xl mx-auto">
        <div className="mb-6">
          <span className="inline-block bg-orange text-white px-4 py-2 rounded-full text-sm font-semibold">TENDENCIAS 2026</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">Tu estilo, nuestro acompañamiento</h1>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">Descubre prendas pensadas para vos. Calidad, confort y estilo en cada pieza.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href={import.meta.env.VITE_STORE_URL} target="_blank" rel="noopener noreferrer" className="bg-dark text-white px-8 py-3 rounded font-semibold hover:opacity-90 text-center">
            Ir a la tienda
          </a>
          <a href="#productos" className="border-2 border-dark text-dark px-8 py-3 rounded font-semibold hover:bg-dark hover:text-white transition text-center">
            Ver productos
          </a>
        </div>
      </section>

      {/* 3. CTA Principal (ya incluido arriba) */}

      {/* 4. Beneficios */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">Ventajas de comprar con nosotros</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="p-8 border-2 border-gray-200 rounded-lg hover:border-orange transition">
                <div className="text-2xl font-bold text-orange mb-4">{idx + 1}.</div>
                <p className="text-gray-700 font-semibold">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Accesos Rápidos */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">Explora nuestras categorías</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {quickLinks.map((link, idx) => (
              <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="bg-white border-2 border-dark rounded-lg p-6 text-center font-semibold hover:bg-dark hover:text-white transition">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Promoción */}
      <section className="bg-orange text-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">🔥 15% OFF en Otoño-Invierno</h2>
          <p className="text-lg mb-8 opacity-90">Descubre las mejores prendas de la temporada con descuento especial</p>
          <a href="https://www.simonashop.com.ar/categoria/otono-invierno?promo=oi15" target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-orange px-8 py-3 rounded font-semibold hover:opacity-90">
            Ver promoción
          </a>
        </div>
      </section>

      {/* 7. Productos Bestsellers */}
      <section id="productos" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">Bestsellers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <a key={idx} href={product.url} target="_blank" rel="noopener noreferrer" className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition">
                <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <button className="w-full bg-orange text-white py-2 rounded font-semibold hover:opacity-90">
                    Ver producto
                  </button>
                </div>
              </a>
            ))}
          </div>
          <div className="text-center mt-12">
            <a href={import.meta.env.VITE_STORE_URL} target="_blank" rel="noopener noreferrer" className="text-orange font-semibold underline hover:opacity-70">
              Ver más bestsellers →
            </a>
          </div>
        </div>
      </section>

      {/* 8. Bloque de Confianza */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">+200.000 personas confían en nosotros</h2>
          <p className="text-xl text-gray-700">Desde 2019 acompañando tu estilo, con showroom y tienda online</p>
        </div>
      </section>

      {/* 9. WhatsApp CTA */}
      <section className="bg-dark text-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">¿Dudas de talle o necesitás ayuda?</h2>
          <p className="text-lg mb-8 opacity-90">Escribinos por WhatsApp y te ayudamos a elegir</p>
          <a href={import.meta.env.VITE_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-block bg-[#25D366] text-white px-8 py-3 rounded font-semibold hover:opacity-90">
            Hablar por WhatsApp
          </a>
        </div>
      </section>

      {/* 10. Links Secundarios */}
      <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-sm">
            <a href={import.meta.env.VITE_STORE_URL} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-orange font-semibold">Cómo comprar</a>
            <a href={import.meta.env.VITE_STORE_URL} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-orange font-semibold">Cambios y devoluciones</a>
            <a href={import.meta.env.VITE_STORE_URL} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-orange font-semibold">Seguimiento</a>
            <a href={import.meta.env.VITE_STORE_URL} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-orange font-semibold">Preguntas frecuentes</a>
          </div>
        </div>
      </section>

      {/* 11. Redes Sociales */}
      <section className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-8">Síguenos en redes</h3>
          <div className="flex justify-center gap-6 flex-wrap">
            <a href={import.meta.env.VITE_INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-orange font-bold">📷 Instagram</a>
            <a href={import.meta.env.VITE_TIKTOK_LINK} target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-orange font-bold">🎵 TikTok</a>
            <a href={`mailto:${import.meta.env.VITE_EMAIL}`} className="text-2xl hover:text-orange font-bold">✉️ Email</a>
          </div>
        </div>
      </section>

      {/* 12. Footer */}
      <footer className="bg-dark text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-4">© 2026 Simona Shop | Prendas para tu estilo</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href={import.meta.env.VITE_STORE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-orange">Política de privacidad</a>
            <a href={import.meta.env.VITE_STORE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-orange">Términos y condiciones</a>
          </div>
        </div>
      </footer>

      {/* WhatsApp flotante */}
      <a href={import.meta.env.VITE_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl hover:scale-110 transition shadow-lg">
        💬
      </a>
    </div>
  )
}

export default App
