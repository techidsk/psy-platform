import {
    ChevronLeft,
    ChevronRight,
    Command,
    Loader2,
    Plus,
    Settings,
    Box,
    X,
    Home,
    Settings2,
    History,
    Play,
    Pause,
    FolderOpen,
    CreditCard,
    User,
    ArrowRight,
    type Icon as LucideIcon,
} from "lucide-react"



export type Icon = LucideIcon

export const Icons = {
    billing: CreditCard,
    arrowRight: ArrowRight,
    setting: Settings2,
    logo: Command,
    close: X,
    spinner: Loader2,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    folder: FolderOpen,
    settings: Settings,
    add: Plus,
    engine: Box,
    dashboard: Home,
    history: History,
    play: Play,
    pause: Pause,
    users: User,
}
