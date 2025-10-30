import Image from "next/image"

export function Logo() {
  return (
    <div className="flex items-center space-x-1 sm:space-x-3">
      {/* Light mode logo */}
      <Image 
        src="/logo-light.svg" 
        alt="Wessley AI" 
        width={48}
        height={48}
        className="h-6 w-auto sm:h-12 dark:hidden"
      />
      {/* Dark mode logo */}
      <Image 
        src="/logo-dark.svg" 
        alt="Wessley AI" 
        width={48}
        height={48}
        className="h-6 w-auto sm:h-12 hidden dark:block"
      />
      <span className="keania-one-regular tracking-wide text-lg sm:text-4xl" style={{color: '#22E974'}}>
        WESSLEY AI
      </span>
    </div>
  )
}