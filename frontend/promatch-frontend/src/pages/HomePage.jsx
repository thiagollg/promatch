import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getAllLanguages, getAllLocations, getAllSubjects, searchProfessors, getRecommendedProfessorsBySubjects } from '../lib/api'
import ProffessorCard from '../components/ProffessorCard'
import ProfessorCarousel from '../components/ProfessorCarousel'
import { Search, MapPin, Languages, BookOpen, DollarSign, Filter, X, ChevronDown } from 'lucide-react'

const HomePage = () => {
 
  const [q, setQ] = useState("")
  const [locationId, setLocationId] = useState("")
  const [languageId, setLanguageId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [priceMax, setPriceMax] = useState(0)
  const [sort, setSort] = useState("desc") 
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [appliedFilters, setAppliedFilters] = useState({ q: "", locationId: "", languageId: "", subjectId: "", priceMax: 0, sort: "desc" })
  const [isSearchActive, setIsSearchActive] = useState(false)
  
  
  const hasAppliedSomething = useMemo(() => {
    return isSearchActive || Boolean(appliedFilters.q || appliedFilters.locationId || appliedFilters.languageId || appliedFilters.subjectId || (appliedFilters.priceMax && Number(appliedFilters.priceMax) > 0))
  }, [appliedFilters, isSearchActive])
  
  
  const {data: recommendedProfessors=[], isLoading: loadingRecommended} = useQuery({
    queryKey: ["recommended-professors-by-subjects"],
    queryFn: getRecommendedProfessorsBySubjects,
    enabled: !hasAppliedSomething,
  })
  
  
  const { data: languages = [] } = useQuery({ queryKey: ["languages"], queryFn: getAllLanguages })
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: getAllLocations })
  const { data: subjects = [] } = useQuery({ queryKey: ["subjects"], queryFn: getAllSubjects })

  
  const baseParams = useMemo(() => {
    const params = {
      limit: 50,
    }
    
    const hasFilters = Boolean(appliedFilters.q || appliedFilters.locationId || appliedFilters.languageId || appliedFilters.subjectId || (appliedFilters.priceMax && Number(appliedFilters.priceMax) > 0))
    if (hasFilters) {
      params.sort = appliedFilters.sort || "desc"
    } else {
      
      params.sort = "random"
    }
    if (appliedFilters.q) params.q = appliedFilters.q
    if (appliedFilters.locationId) params.locationId = appliedFilters.locationId
    if (appliedFilters.languageId) params.languageId = appliedFilters.languageId
    if (appliedFilters.subjectId) params.subjectId = appliedFilters.subjectId
    if (appliedFilters.priceMax && Number(appliedFilters.priceMax) > 0) params.priceMax = appliedFilters.priceMax
    return params
  }, [appliedFilters])

  
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["professors-search", baseParams],
    queryFn: ({ pageParam = 1 }) => searchProfessors({ ...baseParams, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      
      if (lastPage?.hasMore === true) {
        return (lastPage.page || allPages.length) + 1
      }
      
      return undefined
    },
    initialPageParam: 1,
    enabled: hasAppliedSomething,
  })

  
  const sentinelRef = useRef(null)
  const fetchNextPageRef = useRef(fetchNextPage)
  
  // Mantener la referencia de fetchNextPage 
  useEffect(() => {
    fetchNextPageRef.current = fetchNextPage
  }, [fetchNextPage])
  
  useEffect(() => {
    if (!hasAppliedSomething || isLoading) return
    
    const sentinel = sentinelRef.current
    if (!sentinel) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPageRef.current()
        }
      },
      {
        root: null,
        rootMargin: '300px',
        threshold: 0, 
      }
    )
    
    observer.observe(sentinel)
    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, hasAppliedSomething, data])

 
  const applyFilters = () => {
    setAppliedFilters({ q, locationId, languageId, subjectId, priceMax, sort })
    setIsSearchActive(true)
  }

  // Reiniciar búsqueda
  const resetSearch = () => {
    setQ("")
    setLocationId("")
    setLanguageId("")
    setSubjectId("")
    setPriceMax(0)
    setSort("desc")
    setAppliedFilters({ q: "", locationId: "", languageId: "", subjectId: "", priceMax: 0, sort: "desc" })
    setIsSearchActive(false) 
  }


  const handleSortChange = (e) => {
    const value = e.target.value
    setSort(value)
    setAppliedFilters((prev) => ({ ...prev, sort: value }))
  }

  const list = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((p) => p?.data || [])
  }, [data])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Encuentra tu profesor ideal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Conecta con profesores expertos en las materias que necesitas. Busca, compara y elige el que mejor se adapte a ti.
          </p>
        </div>

        {/* Search Control */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          {/* Main Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Search className="h-5 w-5" />
              </span>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nombre, especialidad o descripción..."
                className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm text-black placeholder:text-gray-400 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
            <button
              onClick={applyFilters}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-lg bg-black px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </>
              )}
            </button>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filtros avanzados
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Location */}
                <div className="relative group">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 group-focus-within:text-black">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-3 text-sm text-black shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 appearance-none cursor-pointer"
                  >
                    <option value="">Todas las ubicaciones</option>
                    {locations.map((loc) => (
                      <option key={loc._id} value={loc._id}>{loc.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                {/* Language */}
                <div className="relative group">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 group-focus-within:text-black">
                    <Languages className="h-5 w-5" />
                  </span>
                  <select
                    value={languageId}
                    onChange={(e) => setLanguageId(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-3 text-sm text-black shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 appearance-none cursor-pointer"
                  >
                    <option value="">Todos los idiomas</option>
                    {languages.map((lang) => (
                      <option key={lang._id} value={lang._id}>{lang.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                {/* Subject */}
                <div className="relative group">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 group-focus-within:text-black">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-3 text-sm text-black shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 appearance-none cursor-pointer"
                  >
                    <option value="">Todas las materias</option>
                    {subjects.map((subj) => (
                      <option key={subj._id} value={subj._id}>{subj.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                {/* Price Slider */}
                <div className="relative col-span-1 md:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-4">
                    <span className="pointer-events-none text-gray-400">
                      <DollarSign className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Precio máximo: {priceMax === 0 ? "Sin límite" : `$${priceMax.toLocaleString()}`}
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setPriceMax(0)}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                            priceMax === 0
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Sin límite
                        </button>
                        <input
                          type="range"
                          min={5000}
                          max={30000}
                          step={500}
                          value={priceMax === 0 ? 5000 : Math.max(5000, Math.min(30000, priceMax))}
                          onChange={(e) => {
                            const newValue = Number(e.target.value)
                            setPriceMax(newValue)
                          }}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <span className="text-sm text-gray-600 min-w-[80px] text-right">
                          ${priceMax === 0 ? "∞" : Math.max(5000, Math.min(30000, priceMax)).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>$5,000</span>
                        <span>$30,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Controls */}
        {hasAppliedSomething && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-black">
                {Boolean(appliedFilters.q || appliedFilters.locationId || appliedFilters.languageId || appliedFilters.subjectId || (appliedFilters.priceMax && Number(appliedFilters.priceMax) > 0)) 
                  ? "Resultados" 
                  : "Todos los profesores"}
              </h2>
              <span className="text-sm text-gray-500">({list.length} profesores)</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex items-center gap-2">
                <label className="text-sm text-gray-700 whitespace-nowrap">Ordenar:</label>
                <select
                  value={sort}
                  onChange={handleSortChange}
                  className="block rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-sm text-black shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 appearance-none cursor-pointer"
                  disabled={!Boolean(appliedFilters.q || appliedFilters.locationId || appliedFilters.languageId || appliedFilters.subjectId || (appliedFilters.priceMax && Number(appliedFilters.priceMax) > 0))}
                >
                  <option value="desc">Precio: Mayor a menor</option>
                  <option value="asc">Precio: Menor a mayor</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={resetSearch}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </button>
            </div>
          </div>
        )}

        {/* Search Results */}
        {hasAppliedSomething && (
          <>
            {isLoading ? (
              <div className='flex justify-center py-20'>
                <span className='loading loading-spinner loading-lg'></span>
              </div>
            ) : list.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">No se encontraron profesores</h3>
                <p className="text-gray-600">Intenta ajustar tus filtros de búsqueda</p>
              </div>
            ) : (
              <>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                  {list.map((proffessor) => (
                    <ProffessorCard key={proffessor._id} proffessor={proffessor} />
                  ))}
                </div>

                {/* Sentinel para infinite scroll */}
                <div ref={sentinelRef} className="py-12 flex flex-col items-center gap-4 min-h-[200px]">
                  {isFetchingNextPage ? (
                    <>
                      <span className='loading loading-spinner loading-md'></span>
                      <span className="text-gray-500">Cargando más profesores...</span>
                    </>
                  ) : hasNextPage ? (
                    <span className="text-gray-500">Desplázate para cargar más profesores...</span>
                  ) : (
                    <span className="text-gray-500">Has llegado al final de los resultados</span>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Carousel - Only when no search */}
        {!hasAppliedSomething && (
          <div className="mt-8">
            {loadingRecommended ? (
              <div className='flex justify-center py-20'>
                <span className='loading loading-spinner loading-lg'></span>
              </div>
            ) : recommendedProfessors.length > 0 ? (
              <ProfessorCarousel professors={recommendedProfessors} />
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-600">No hay profesores recomendados disponibles. Realiza una búsqueda para encontrar profesores.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
