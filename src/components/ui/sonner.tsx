import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps, toast } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group font-mono text-xs"
      position="top-right"
      richColors
      expand={true}
      closeButton
      duration={3500}
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-400 shrink-0" />,
        info: <InfoIcon className="size-4 text-gold shrink-0" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-400 shrink-0" />,
        error: <OctagonXIcon className="size-4 text-red-400 shrink-0" />,
        loading: <Loader2Icon className="size-4 animate-spin text-gold shrink-0" />,
      }}
      toastOptions={{
        style: {
          background: '#0e0e11',
          color: '#ffffff',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.15)',
          borderRadius: '0.75rem',
        },
        className: 'font-mono text-xs border border-gold/30 backdrop-blur-md',
      }}
      {...props}
    />
  )
}

export { Toaster, toast }

