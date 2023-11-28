export function FeedbackButton() {
  return (
    <div className="absolute bottom-5 right-5">
      <button
        type="submit"
        className="flex flex-row items-center justify-center px-4 py-2 font-bold text-white border-4 rounded-full w-14 h-14 bg-principal border-button-primary"
      >
        <svg
          className="w-8 h-8 text-black fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </div>
  )
}
