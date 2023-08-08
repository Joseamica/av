import { Button } from '..'

export function ReportIntroButtons({ setActiveTab }) {
  return (
    <div className="flex flex-col space-y-2">
      <Button onClick={() => setActiveTab('waiter')} size="medium">
        Mesero
      </Button>
      <Button onClick={() => setActiveTab('food')} size="medium">
        Platillo
      </Button>
      <Button onClick={() => setActiveTab('place')} size="medium">
        Lugar
      </Button>
      <Button onClick={() => setActiveTab('other')} size="medium">
        Otro
      </Button>
    </div>
  )
}
