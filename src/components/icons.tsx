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
    Grid,
    Minus,
    RotateCcw,
    UsersRound,
    Wrench,
    Undo2,
    Pencil,
    Trash,
    AlertTriangle,
    Search,
    FolderKanban,
    ListMinus,
    Save,
    Group,
    Link,
    MonitorPlay,
    BookOpen,
    RefreshCw,
    ArrowUp,
    ArrowDown,
    Copy,
} from 'lucide-react';

const CheckedRight = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-5 h-5 text-primary"
    >
        <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
        />
    </svg>
);
const UncheckedRight = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-5 h-5"
    >
        <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
        />
    </svg>
);

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
    usergroup: UsersRound,
    grid: Grid,
    minus: Minus,
    rotate: RotateCcw,
    wrench: Wrench,
    back: Undo2,
    edit: Pencil,
    delete: Trash,
    alert: AlertTriangle,
    search: Search,
    projects: FolderKanban,
    list: ListMinus,
    save: Save,
    projectGroups: Group,
    undo: Undo2,
    link: Link,
    tv: MonitorPlay,
    preview: BookOpen,
    refresh: RefreshCw,
    checkedRight: CheckedRight,
    uncheckedRight: UncheckedRight,
    up: ArrowUp,
    down: ArrowDown,
    copy: Copy,
};
