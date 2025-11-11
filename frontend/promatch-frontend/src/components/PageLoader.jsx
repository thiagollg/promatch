import React from 'react'
import {LoaderIcon} from "lucide-react"
const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <LoaderIcon className="animate-spin size-12 text-black"/>
    </div>
  )
}

export default PageLoader