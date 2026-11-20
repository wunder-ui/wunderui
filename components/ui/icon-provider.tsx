"use client"

import * as React from "react"
import {
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUp,
  ArrowRight,
  ArrowUpRight,
  AtSign,
  Ban,
  Bell,
  Bold,
  Bot,
  Building2,
  Calendar,
  CalendarDays,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  ChevronUp,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleHelp,
  CircleMinus,
  CircleSlash,
  Clock,
  CloudUpload,
  Copy,
  Download,
  Ellipsis,
  EllipsisVertical,
  ExternalLink,
  Eye,
  EyeOff,
  FileIcon,
  FileCode,
  FileDiff,
  FilePenLine,
  FileText,
  Film,
  Flag,
  Folder,
  FolderOpen,
  Globe,
  GripVertical,
  Hand,
  Handshake,
  Hash,
  Heading1,
  Heading2,
  Heart,
  ImageIcon,
  ImageOff,
  Inbox,
  Info,
  Italic,
  LinkIcon,
  Link2,
  List,
  ListFilter,
  ListOrdered,
  ListTodo,
  LoaderCircle,
  Lock,
  Maximize2,
  Menu,
  MessageCircle,
  MessageSquare,
  Mic,
  Minimize2,
  Minus,
  Moon,
  MousePointer2,
  Package,
  Pause,
  Play,
  PanelRight,
  PictureInPicture2,
  Paperclip,
  Pencil,
  Pin,
  PinOff,
  Pipette,
  Plus,
  ReceiptText,
  RefreshCw,
  Reply,
  RotateCcw,
  RotateCw,
  Scan,
  SeparatorHorizontal,
  Search,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  Slash,
  SlidersHorizontal,
  Smartphone,
  Split,
  Sparkles,
  Square,
  SquareCode,
  SquareCheck,
  SquareCheckBig,
  Star,
  StickyNote,
  Sun,
  Table2,
  ThumbsDown,
  ThumbsUp,
  Timer,
  Trash2,
  TextQuote,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Underline,
  Undo2,
  UserRound,
  Workflow,
  Wrench,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

/**
 * Props every icon of an `IconSet` receives: the SVG attributes the components set (`className`,
 * `aria-hidden`, `strokeWidth`, `data-*`, `style` …) and `size`. Sizes come from the `size-*` classes
 * the components put on the icon, so a replacement only has to pass `className` on to its `<svg>`.
 */
type IconProps = Omit<React.SVGProps<SVGSVGElement>, "ref" | "children" | "dangerouslySetInnerHTML"> & {
  /** Width and height; the components size icons through `className` instead. */
  size?: number | string
}

type IconComponent = React.ComponentType<IconProps>

// The checkbox draws its mark heavier so it reads at 14 px: 3 on lucide's 24 grid for the check, 4
// for the minus. The weight belongs to the Lucide drawing, so a replacement set brings its own.
function CheckboxCheck(props: IconProps) {
  return <Check strokeWidth={3} {...props} />
}
function CheckboxIndeterminate(props: IconProps) {
  return <Minus strokeWidth={4} {...props} />
}

/**
 * The Lucide glyphs the components draw themselves (chevrons, checks, close buttons, status marks,
 * table tools …), one name per role. `IconProvider` swaps them for another set; without a provider
 * the components render exactly these Lucide icons. Icons you pass to a component as a prop are
 * yours and never resolved through here.
 */
const DEFAULT_ICONS = {
  // chevrons and arrows
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronsLeft: ChevronsLeft,
  chevronsRight: ChevronsRight,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUpRight: ArrowUpRight,
  arrowDownRight: ArrowDownRight,
  trendUp: TrendingUp,
  trendDown: TrendingDown,
  moveUp: ArrowUp,
  moveDown: ArrowDown,
  send: ArrowUp,
  external: ExternalLink,
  // actions
  check: Check,
  close: X,
  plus: Plus,
  minus: Minus,
  search: Search,
  searchEmpty: SearchX,
  copy: Copy,
  download: Download,
  upload: CloudUpload,
  edit: Pencil,
  trash: Trash2,
  undo: Undo2,
  reset: RotateCcw,
  regenerate: RotateCcw,
  retry: RotateCw,
  refresh: RefreshCw,
  more: Ellipsis,
  moreVertical: EllipsisVertical,
  grip: GripVertical,
  menu: Menu,
  panelRight: PanelRight,
  expand: Maximize2,
  collapse: Minimize2,
  // floating panel windows
  minimize: Minus,
  dock: PanelRight,
  undock: PictureInPicture2,
  show: Eye,
  hide: EyeOff,
  pin: Pin,
  unpin: PinOff,
  eyedropper: Pipette,
  attach: Paperclip,
  stop: Square,
  microphone: Mic,
  reply: Reply,
  thumbsUp: ThumbsUp,
  thumbsDown: ThumbsDown,
  // data table
  filter: ListFilter,
  view: SlidersHorizontal,
  sortAsc: ArrowUp,
  sortDesc: ArrowDown,
  sortNone: ChevronsUpDown,
  pinStart: ArrowLeftToLine,
  pinEnd: ArrowRightToLine,
  chart: ChartColumn,
  table: Table2,
  // form marks
  checkboxCheck: CheckboxCheck,
  checkboxIndeterminate: CheckboxIndeterminate,
  checkboxOff: Square,
  checkboxOn: SquareCheck,
  radioOff: Circle,
  radioOn: CircleDot,
  // status
  spinner: LoaderCircle,
  warning: TriangleAlert,
  error: CircleAlert,
  success: CircleCheck,
  info: Info,
  help: CircleHelp,
  verified: ShieldCheck,
  securityAlert: ShieldAlert,
  cancelled: Ban,
  pause: Pause,
  play: Play,
  pending: Circle,
  circleDashed: CircleDashed,
  circleMinus: CircleMinus,
  circleSlash: CircleSlash,
  lock: Lock,
  inbox: Inbox,
  imageMissing: ImageOff,
  clock: Clock,
  timer: Timer,
  calendar: CalendarDays,
  dueDate: Calendar,
  notification: Bell,
  sun: Sun,
  moon: Moon,
  star: Star,
  heart: Heart,
  package: Package,
  smartphone: Smartphone,
  // chart event markers (ChartAnnotations events)
  flag: Flag,
  // AI and chat
  agent: Bot,
  user: UserRound,
  tool: Wrench,
  sparkles: Sparkles,
  zap: Zap,
  globe: Globe,
  comment: MessageCircle,
  message: MessageSquare,
  mention: AtSign,
  hash: Hash,
  link: Link2,
  // files
  file: FileIcon,
  document: FileText,
  fileCode: FileCode,
  fileDiff: FileDiff,
  image: ImageIcon,
  video: Film,
  folder: Folder,
  folderOpen: FolderOpen,
  // records (Record Chip)
  customer: Building2,
  deal: Handshake,
  invoice: ReceiptText,
  contract: FilePenLine,
  task: SquareCheckBig,
  note: StickyNote,
  // breadcrumb
  slash: Slash,
  // rich text editor
  formatBold: Bold,
  formatItalic: Italic,
  formatUnderline: Underline,
  formatBulletList: List,
  formatNumberedList: ListOrdered,
  formatLink: LinkIcon,
  formatHeading1: Heading1,
  formatHeading2: Heading2,
  formatTaskList: ListTodo,
  formatQuote: TextQuote,
  formatDivider: SeparatorHorizontal,
  formatCode: SquareCode,
  // flow canvas
  zoomIn: ZoomIn,
  zoomOut: ZoomOut,
  fitView: Scan,
  toolSelect: MousePointer2,
  toolHand: Hand,
  tidyUp: Workflow,
  branch: Split,
} satisfies Record<string, IconComponent>

/** Every built-in icon role of the components (see `DEFAULT_ICONS`). */
type IconName = keyof typeof DEFAULT_ICONS

/** A replacement for some or all built-in icons; names left out keep the icon of the parent provider (or Lucide). */
type IconSet = Partial<Record<IconName, IconComponent>>

const IconContext = React.createContext<IconSet | null>(null)

type IconProviderProps = {
  /** The icons to use instead of Lucide, by name. Names left out keep the icon of the parent provider. */
  icons: IconSet
  children?: React.ReactNode
}

/**
 * Swaps the icons the components draw themselves (the Select chevron, the Checkbox check, the Dialog
 * close button, the Data Table tools …) for another set. Providers nest: an inner provider replaces
 * only the names it lists. It renders no UI, and portals (Dialog, Sheet, menus) inherit it, since they
 * stay in the React tree. Without a provider every component draws Lucide.
 *
 * @example
 * import { solarSet } from "@wunderui/react/icons/solar/set"
 *
 * <IconProvider icons={solarSet}>
 *   <App />
 * </IconProvider>
 */
function IconProvider({ icons, children }: IconProviderProps) {
  const parent = React.useContext(IconContext)
  const value = React.useMemo(() => (parent ? { ...parent, ...icons } : icons), [parent, icons])
  return <IconContext.Provider value={value}>{children}</IconContext.Provider>
}

/**
 * The component for a built-in icon name: the one of the nearest `IconProvider`, otherwise the Lucide
 * default.
 *
 * @example
 * const ChevronIcon = useIcon("chevronDown")
 * return <ChevronIcon className="size-4" />
 */
function useIcon(name: IconName): IconComponent {
  const icons = React.useContext(IconContext)
  return icons?.[name] ?? DEFAULT_ICONS[name]
}

type IconByNameProps = IconProps & {
  /** The built-in icon role, resolved through the nearest `IconProvider`. */
  name: IconName
}

/**
 * Draws a built-in icon by name, through the nearest `IconProvider`.
 *
 * @example
 * <Icon name="chevronDown" className="size-4" />
 */
function Icon({ name, ...props }: IconByNameProps) {
  const Component = useIcon(name)
  return <Component {...props} />
}

export { DEFAULT_ICONS, Icon, IconProvider, useIcon }
export type { IconByNameProps, IconComponent, IconName, IconProps, IconProviderProps, IconSet }
