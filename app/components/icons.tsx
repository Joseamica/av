export function BookIcon({ size = 24 }: { size?: number } = {}) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <path d="M19.25 15.25v-9.5a1 1 0 00-1-1H6.75a2 2 0 00-2 2v10" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.25 15.25H6.75a2 2 0 100 4h12.5v-4z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CashIcon({ size = 24, stroke = 'currentColor', className }: { size?: number; stroke?: string; className?: string } = {}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" className={className} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  )
}

export function XCashIcon({ size = 24, stroke = 'currentColor', className }: { size?: number; stroke?: string; className?: string } = {}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" className={className} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18l4 4m0 -4l-4 4" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M5.75 12.8665L8.33995 16.4138C9.15171 17.5256 10.8179 17.504 11.6006 16.3715L18.25 6.75"
      />
    </svg>
  )
}
export function ChevronDownIcon({ className, title }: { className?: string; title?: string }) {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className={className}>
      {title ? <title>{title}</title> : null}
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.25 10.75L12 14.25L8.75 10.75" />
    </svg>
  )
}
export function ChevronLeftIcon({ className, title }: { className?: string; title?: string }) {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className={className}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.25 8.75L9.75 12L13.25 15.25" />
    </svg>
  )
}

export function ChevronRightIcon({ className, title }: { className?: string; title?: string }) {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className={className}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.75 8.75L14.25 12L10.75 15.25" />
    </svg>
  )
}
export function ChevronUpIcon({ className, title }: { className?: string; title?: string }) {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className={className}>
      {title ? <title>{title}</title> : null}
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.25 14.25L12 10.75L8.75 14.25" />
    </svg>
  )
}

export function ClipboardIcon() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M9 6.75H7.75C6.64543 6.75 5.75 7.64543 5.75 8.75V17.25C5.75 18.3546 6.64543 19.25 7.75 19.25H16.25C17.3546 19.25 18.25 18.3546 18.25 17.25V8.75C18.25 7.64543 17.3546 6.75 16.25 6.75H15"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M14 8.25H10C9.44772 8.25 9 7.80228 9 7.25V5.75C9 5.19772 9.44772 4.75 10 4.75H14C14.5523 4.75 15 5.19772 15 5.75V7.25C15 7.80228 14.5523 8.25 14 8.25Z"
      />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 12.25H14.25" />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 15.25H14.25" />
    </svg>
  )
}
export function DollarIcon({ size = 24 }: { size?: number } = {}) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M14.25 8.75H11.375C10.4775 8.75 9.75 9.47754 9.75 10.375V10.375C9.75 11.2725 10.4775 12 11.375 12H12.625C13.5225 12 14.25 12.7275 14.25 13.625V13.625C14.25 14.5225 13.5225 15.25 12.625 15.25H9.75"
      />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7.75V8.25" />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15.75V16.25" />
    </svg>
  )
}
export function EyeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M19.25 12C19.25 13 17.5 18.25 12 18.25C6.5 18.25 4.75 13 4.75 12C4.75 11 6.5 5.75 12 5.75C17.5 5.75 19.25 11 19.25 12Z"
      />
      <circle cx="12" cy="12" r="2.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  )
}

export function FeedBackIcon({ className }: { className?: string }) {
  return (
    <svg height="24px" viewBox="0 0 24 24" width="24px" fill="#fff" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M 20 2 L 4 2 C 2.9 2 2 2.9 2 4 L 2 22 L 6 18 L 20 18 C 21.1 18 22 17.1 22 16 L 22 4 C 22 2.9 21.1 2 20 2 Z M 20 16 L 5.17 16 L 4 17.17 L 20.087 16.03 L 20 4 L 20 16 Z M 11 12 L 13 12 L 13 14 L 11 14 L 11 12 Z M 11 6 L 13 6 L 13 10 L 11 10 L 11 6 Z" />
    </svg>
  )
}

export function HamburgerIcon({ size = 24, fill = '#000', className }: { size?: number; fill?: string; className?: string } = {}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height={size} viewBox="0 0 24 24" width={size} fill={fill} className={className}>
      <g>
        <rect fill="none" height="24" width="24" />
      </g>
      <g>
        <g>
          <path d="M2,19c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2v-3H2V19z M4,18h16v1H4V18z" />
          <path d="M18.66,11.5c-1.95,0-2.09,1-3.33,1c-1.19,0-1.42-1-3.33-1c-1.95,0-2.09,1-3.33,1c-1.19,0-1.42-1-3.33-1 c-1.95,0-2.09,1-3.33,1v2c1.9,0,2.17-1,3.35-1c1.19,0,1.42,1,3.33,1c1.95,0,2.09-1,3.33-1c1.19,0,1.42,1,3.33,1 c1.95,0,2.09-1,3.33-1c1.19,0,1.4,0.98,3.32,1l-0.01-1.98C20.38,12.19,20.37,11.5,18.66,11.5z" />
          <path d="M22,9c0.02-4-4.28-6-10-6C6.29,3,2,5,2,9v1h20L22,9L22,9z M4.18,8C5.01,5.81,8.61,5,12,5c3.31,0,5.93,0.73,7.19,1.99 C19.49,7.3,19.71,7.63,19.84,8H4.18z" />
        </g>
      </g>
    </svg>
  )
}

export function XHamburgerIcon({ size = 24, fill = '#000', className }: { size?: number; fill?: string; className?: string } = {}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height={size} viewBox="0 0 24 24" width={size} fill={fill} className={className}>
      <g>
        <rect fill="none" height="24" width="24" />
      </g>
      <g>
        <g>
          <path d="M2,19c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2v-3H2V19z M4,18h16v1H4V18z" />
          <path d="M18.66,11.5c-1.95,0-2.09,1-3.33,1c-1.19,0-1.42-1-3.33-1c-1.95,0-2.09,1-3.33,1c-1.19,0-1.42-1-3.33-1 c-1.95,0-2.09,1-3.33,1v2c1.9,0,2.17-1,3.35-1c1.19,0,1.42,1,3.33,1c1.95,0,2.09-1,3.33-1c1.19,0,1.42,1,3.33,1 c1.95,0,2.09-1,3.33-1c1.19,0,1.4,0.98,3.32,1l-0.01-1.98C20.38,12.19,20.37,11.5,18.66,11.5z" />
          <path d="M22,9c0.02-4-4.28-6-10-6C6.29,3,2,5,2,9v1h20L22,9L22,9z M4.18,8C5.01,5.81,8.61,5,12,5c3.31,0,5.93,0.73,7.19,1.99 C19.49,7.3,19.71,7.63,19.84,8H4.18z" />
        </g>
      </g>
      <g>
        <path d="M18,18 l4,4 m-4,0 l-4,4" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  )
}
export function ManagerIcon({ className, ...props }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 122.88 122.66" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M43.84,78.55l9.74,28.64l4.9-17l-2.4-2.63c-1.08-1.58-1.32-2.96-0.72-4.15c1.3-2.57,3.99-2.09,6.5-2.09 
        c2.63,0,5.89-0.5,6.71,2.8c0.28,1.1-0.07,2.26-0.84,3.44l-2.4,2.63l4.9,17l8.82-28.64c6.36,5.72,25.19,6.87,32.2,10.78 
        c2.22,1.24,4.22,2.81,5.83,4.93c2.44,3.23,3.94,7.44,4.35,12.79l1.46,9.33c-0.36,3.78-2.5,5.96-6.73,6.29H61.9H6.73 
        c-4.23-0.32-6.37-2.5-6.73-6.29l1.46-9.33c0.41-5.35,1.91-9.56,4.35-12.79c1.61-2.13,3.61-3.7,5.83-4.93 
        C18.65,85.42,37.48,84.27,43.84,78.55L43.84,78.55z M39.43,37.56c-1.21,0.05-2.12,0.3-2.74,0.72c-0.36,0.24-0.62,0.55-0.79,0.91 
        c-0.19,0.4-0.27,0.89-0.26,1.46c0.05,1.66,0.92,3.82,2.59,6.31l0.02,0.04l0,0l5.44,8.66c2.18,3.47,4.47,7.01,7.31,9.61 
        c2.73,2.5,6.05,4.19,10.44,4.2c4.75,0.01,8.23-1.75,11.04-4.39c2.93-2.75,5.25-6.51,7.53-10.27l6.13-10.1 
        c1.14-2.61,1.56-4.35,1.3-5.38c-0.16-0.61-0.83-0.91-1.97-0.96c-0.24-0.01-0.49-0.01-0.75-0.01c-0.27,0.01-0.56,0.03-0.86,0.05 
        c-0.16,0.01-0.32,0-0.47-0.03c-0.55,0.03-1.11-0.01-1.68-0.09l2.1-9.29c-11.21-0.14-18.88-2.09-27.95-7.89 
        c-2.98-1.9-3.88-4.08-6.86-3.87c-2.25,0.43-4.14,1.44-5.65,3.06c-1.44,1.55-2.53,3.67-3.24,6.38l1.19,10.95 
        C40.64,37.67,40.01,37.65,39.43,37.56L39.43,37.56z M87.57,35.61c1.51,0.46,2.48,1.42,2.87,2.97c0.44,1.72-0.04,4.13-1.49,7.43l0,0 
        c-0.03,0.06-0.06,0.12-0.09,0.18l-6.2,10.22c-2.39,3.94-4.82,7.88-8.06,10.92c-3.35,3.14-7.49,5.23-13.14,5.22 
        c-5.28-0.01-9.25-2.03-12.51-5.01c-3.15-2.88-5.56-6.6-7.85-10.24l-5.44-8.65c-1.99-2.97-3.02-5.68-3.09-7.91 
        c-0.03-1.05,0.15-2,0.53-2.83c0.41-0.88,1.03-1.61,1.87-2.17c0.39-0.26,0.83-0.49,1.32-0.67c-0.35-4.69-0.49-10.61-0.26-15.56 
        c0.12-1.17,0.34-2.35,0.67-3.53c1.39-4.97,4.88-8.97,9.2-11.72c1.52-0.97,3.19-1.77,4.95-2.41C61.3-1.95,75.16,0.12,82.58,8.14 
        c3.02,3.27,4.92,7.61,5.33,13.34L87.57,35.61L87.57,35.61z"
        fill="currentColor"
      />
    </svg>
  )
}

export function MenuIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="9" width="20" height="2" rx="1" fill="currentColor" />
      <rect x="6" y="15" width="20" height="2" rx="1" fill="currentColor" />
      <rect x="6" y="21" width="20" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}

export function RestMenuIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000" className={className}>
      <g>
        <rect fill="none" height="24" width="24" />
      </g>
      <g>
        <g />
        <g>
          <path d="M21,5c-1.11-0.35-2.33-0.5-3.5-0.5c-1.95,0-4.05,0.4-5.5,1.5c-1.45-1.1-3.55-1.5-5.5-1.5S2.45,4.9,1,6v14.65 c0,0.25,0.25,0.5,0.5,0.5c0.1,0,0.15-0.05,0.25-0.05C3.1,20.45,5.05,20,6.5,20c1.95,0,4.05,0.4,5.5,1.5c1.35-0.85,3.8-1.5,5.5-1.5 c1.65,0,3.35,0.3,4.75,1.05c0.1,0.05,0.15,0.05,0.25,0.05c0.25,0,0.5-0.25,0.5-0.5V6C22.4,5.55,21.75,5.25,21,5z M21,18.5 c-1.1-0.35-2.3-0.5-3.5-0.5c-1.7,0-4.15,0.65-5.5,1.5V8c1.35-0.85,3.8-1.5,5.5-1.5c1.2,0,2.4,0.15,3.5,0.5V18.5z" />
          <g>
            <path d="M17.5,10.5c0.88,0,1.73,0.09,2.5,0.26V9.24C19.21,9.09,18.36,9,17.5,9c-1.7,0-3.24,0.29-4.5,0.83v1.66 C14.13,10.85,15.7,10.5,17.5,10.5z" />
            <path d="M13,12.49v1.66c1.13-0.64,2.7-0.99,4.5-0.99c0.88,0,1.73,0.09,2.5,0.26V11.9c-0.79-0.15-1.64-0.24-2.5-0.24 C15.8,11.66,14.26,11.96,13,12.49z" />
            <path d="M17.5,14.33c-1.7,0-3.24,0.29-4.5,0.83v1.66c1.13-0.64,2.7-0.99,4.5-0.99c0.88,0,1.73,0.09,2.5,0.26v-1.52 C19.21,14.41,18.36,14.33,17.5,14.33z" />
          </g>
        </g>
      </g>
    </svg>
  )
}

export function OrderIcon({ size = 24, className }: { size?: number; className?: string } = {}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height={size} width={size} className={className}>
      <path d="M368 128h.09m111.46-32h-91.06l8.92-35.66 38.32-13.05c8.15-2.77 13-11.43 10.65-19.71a16 16 0 00-20.54-10.73l-47 16a16 16 0 00-10.36 11.27L355.51 96H224.45c-8.61 0-16 6.62-16.43 15.23A16 16 0 00224 128h2.75l1 8.66A8.3 8.3 0 00236 144c39 0 73.66 10.9 100.12 31.52A121.9 121.9 0 01371 218.07a123.4 123.4 0 0110.12 29.51 7.83 7.83 0 003.29 4.88 72 72 0 0126.38 86.43 7.92 7.92 0 00-.15 5.53A96 96 0 01416 376c0 22.34-7.6 43.63-21.4 59.95a80.12 80.12 0 01-28.78 21.67 8 8 0 00-4.21 4.37 108.19 108.19 0 01-17.37 29.86 2.5 2.5 0 001.9 4.11h49.21a48.22 48.22 0 0047.85-44.14L477.4 128h2.6a16 16 0 0016-16.77c-.42-8.61-7.84-15.23-16.45-15.23z" />
      <path d="M108.69 320a23.87 23.87 0 0117 7l15.51 15.51a4 4 0 005.66 0L162.34 327a23.87 23.87 0 0117-7h196.58a8 8 0 008.08-7.92V312a40.07 40.07 0 00-32-39.2c-.82-29.69-13-54.54-35.51-72C295.67 184.56 267.85 176 236 176h-72c-68.22 0-114.43 38.77-116 96.8A40.07 40.07 0 0016 312a8 8 0 008 8zm77.25 32a8 8 0 00-5.66 2.34l-22.14 22.15a20 20 0 01-28.28 0l-22.14-22.15a8 8 0 00-5.66-2.34h-69.4a15.93 15.93 0 00-15.76 13.17A65.22 65.22 0 0016 376c0 30.59 21.13 55.51 47.26 56 2.43 15.12 8.31 28.78 17.16 39.47C93.51 487.28 112.54 496 134 496h132c21.46 0 40.49-8.72 53.58-24.55 8.85-10.69 14.73-24.35 17.16-39.47 26.13-.47 47.26-25.39 47.26-56a65.22 65.22 0 00-.9-10.83A15.93 15.93 0 00367.34 352z" />
    </svg>
  )
}
export function PlusIcon({ className, ...props }: { className?: string }) {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className={className} {...props}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 5.75V18.25" />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.25 12L5.75 12" />
    </svg>
  )
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="1" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.75068 11.3405C1.65161 9.23359 1.65161 5.80439 3.75068 3.69748C4.76756 2.67681 6.11976 2.11292 7.55689 2.11292C8.99619 2.11292 10.3484 2.67681 11.3653 3.69748C13.4622 5.80439 13.4622 9.23359 11.3653 11.3405C9.2662 13.4452 5.84975 13.4452 3.75068 11.3405ZM18 16.4548L13.595 12.0333C15.7986 9.06529 15.5874 4.8471 12.9047 2.15226C10.0479 -0.715235 5.06587 -0.719606 2.21121 2.15226C-0.737072 5.10937 -0.737072 9.9286 2.21121 12.8857C3.68536 14.3654 5.62112 15.1041 7.55906 15.1041C9.14861 15.1041 10.7229 14.5752 12.0555 13.5785L16.4605 18L18 16.4548Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ShoppingCartIcon({ size = 24, fillColor, cartColor, className }: { size?: number; fillColor?: string; cartColor?: string; className?: string } = {}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 0 24 24" width={size} fill={fillColor} className={className}>
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path
        fill={cartColor}
        d="M15.55 13c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2h7.45zM6.16 6h12.15l-2.76 5H8.53L6.16 6zM7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
      />
    </svg>
  )
}

export function StarIcon({ size = 24, fill = '#fff', className }: { size?: number; fill?: string; className?: string } = {}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 0 24 24" width={size} fill={fill} className={className}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )
}

export function DeleteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" className={className}>
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
    </svg>
  )
}

export function UserCircleIcon({ size = 24, fill = '#fff', className }: { size?: number; fill?: string; className?: string } = {}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 0 24 24" width={size} fill="" className={className}>
      <path
        fill={fill}
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z"
      />
    </svg>
  )
}

export function UsersIcon({ size = 24, className, ...props }: { size?: number; className?: string } = {}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className} {...props}>
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  )
}

export function OutlineUsersIcon({ size = 24 }: { size?: number } = {}) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M5.78168 19.25H13.2183C13.7828 19.25 14.227 18.7817 14.1145 18.2285C13.804 16.7012 12.7897 14 9.5 14C6.21031 14 5.19605 16.7012 4.88549 18.2285C4.773 18.7817 5.21718 19.25 5.78168 19.25Z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M15.75 14C17.8288 14 18.6802 16.1479 19.0239 17.696C19.2095 18.532 18.5333 19.25 17.6769 19.25H16.75"
      />
      <circle cx="9.5" cy="7.5" r="2.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M14.75 10.25C16.2688 10.25 17.25 9.01878 17.25 7.5C17.25 5.98122 16.2688 4.75 14.75 4.75"
      />
    </svg>
  )
}

export function RefreshIcon({ size = 24, title = 'Refresh' }: { size?: number; title?: string }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <title>{title}</title>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 4.75 8.75 7l2.5 2.25M12.75 19.25l2.5-2.25-2.5-2.25" />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 7h3.5a6 6 0 0 1 6 6v.25M14.25 17h-3.5a6 6 0 0 1-6-6v-.25" />
    </svg>
  )
}

export function WaiterIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 122.88 117.09">
      <g>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M36.82,107.86L35.65,78.4l13.25-0.53c5.66,0.78,11.39,3.61,17.15,6.92l10.29-0.41c4.67,0.1,7.3,4.72,2.89,8 
          c-3.5,2.79-8.27,2.83-13.17,2.58c-3.37-0.03-3.34,4.5,0.17,4.37c1.22,0.05,2.54-0.29,3.69-0.34c6.09-0.25,11.06-1.61,13.94-6.55 
          l1.4-3.66l15.01-8.2c7.56-2.83,12.65,4.3,7.23,10.1c-10.77,8.51-21.2,16.27-32.62,22.09c-8.24,5.47-16.7,5.64-25.34,1.01 
          L36.82,107.86L36.82,107.86z M29.74,62.97h91.9c0.68,0,1.24,0.57,1.24,1.24v5.41c0,0.67-0.56,1.24-1.24,1.24h-91.9 
          c-0.68,0-1.24-0.56-1.24-1.24v-5.41C28.5,63.53,29.06,62.97,29.74,62.97L29.74,62.97z M79.26,11.23 
          c25.16,2.01,46.35,23.16,43.22,48.06l-93.57,0C25.82,34.23,47.09,13.05,72.43,11.2V7.14l-4,0c-0.7,0-1.28-0.58-1.28-1.28V1.28 
          c0-0.7,0.57-1.28,1.28-1.28h14.72c0.7,0,1.28,0.58,1.28,1.28v4.58c0,0.7-0.58,1.28-1.28,1.28h-3.89L79.26,11.23L79.26,11.23 
          L79.26,11.23z M0,77.39l31.55-1.66l1.4,35.25L1.4,112.63L0,77.39L0,77.39z"
        />
      </g>
    </svg>
  )
}

export function WifiIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000" className={className}>
      <path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none" />
      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
    </svg>
  )
}

export function XIcon(props: React.ComponentProps<'svg'>): JSX.Element {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000" {...props}>
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  )
}
