export function DhlLogo({ className = 'h-5 sm:h-6 w-auto' }: { className?: string }) {
  return (
    <img
      src="/images/couriers/dhl.svg"
      alt="DHL Express"
      className={`${className} object-contain rounded-[3px]`}
      loading="lazy"
    />
  )
}

export function FedexLogo({ className = 'h-4 sm:h-5 w-auto' }: { className?: string }) {
  return (
    <div className="bg-white px-2 py-1 rounded-[4px] flex items-center justify-center shadow-sm border border-white/20">
      <img
        src="/images/couriers/fedex.svg"
        alt="FedEx Express"
        className={`${className} object-contain`}
        loading="lazy"
      />
    </div>
  )
}

export function UpsLogo({ className = 'h-6 sm:h-7 w-auto' }: { className?: string }) {
  return (
    <div className="flex items-center justify-center p-0.5">
      <img
        src="/images/couriers/ups.svg"
        alt="UPS Worldwide"
        className={`${className} object-contain drop-shadow-sm`}
        loading="lazy"
      />
    </div>
  )
}

export function ShippingLogosBar({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex flex-wrap items-center gap-3 sm:gap-4 ${className}`}>
      <div className="flex items-center transition-transform duration-300 hover:scale-105" title="DHL Express">
        <DhlLogo className="h-5 sm:h-6 w-auto shadow-sm" />
      </div>
      <div className="flex items-center transition-transform duration-300 hover:scale-105" title="FedEx Express">
        <FedexLogo className="h-4 sm:h-5 w-auto" />
      </div>
      <div className="flex items-center transition-transform duration-300 hover:scale-105" title="UPS Worldwide">
        <UpsLogo className="h-6 sm:h-7 w-auto" />
      </div>
    </div>
  )
}
