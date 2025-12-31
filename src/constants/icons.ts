import {
  Cpu, Rocket, BarChart3, Globe, ShieldCheck, HelpCircle,
  Search, X, LayoutGrid, Upload, Image as ImageIcon, History, Trash2, Globe as GlobeIcon,
  Code, Layers, HardDrive, GitBranch, GitCommit, GitPullRequest, Binary, Bot, Boxes,
  CircuitBoard, Container, Database, FileCode, Microchip,
  Dna, FlaskConical, Atom, Microscope, Beaker, TestTube, FlaskRound, Radiation, Biohazard,
  Brain, HeartPulse, Thermometer, Bone, Droplet, Waves, Stethoscope, Pill, Activity,
  BarChart, Target, PieChart, TrendingUp, Briefcase, Calculator, Coins, Gem, Landmark,
  Wallet, Trophy, Medal, CreditCard,
  Users, Mail, MessageSquare, Share2, Smartphone, MapPin, Airplay, Globe2, Satellite,
  Wifi, Map, MessageCircle, Phone,
  Shield, Lock, Settings, Zap, Bell, Check, PlusCircle, Info, ShieldAlert, Key,
  Fingerprint, Wrench, Menu
} from 'lucide-react';

export const LUCIDE_ICON_MAP: Record<string, any> = {
  Cpu, Rocket, BarChart3, Globe, ShieldCheck, HelpCircle,
  Search, X, LayoutGrid, Upload, ImageIcon, History, Trash2, GlobeIcon,
  Code, Layers, HardDrive, GitBranch, GitCommit, GitPullRequest, Binary, Bot, Boxes,
  CircuitBoard, Container, Database, FileCode, Microchip,
  Dna, FlaskConical, Atom, Microscope, Beaker, TestTube, FlaskRound, Radiation, Biohazard,
  Brain, HeartPulse, Thermometer, Bone, Droplet, Waves, Stethoscope, Pill, Activity,
  BarChart, Target, PieChart, TrendingUp, Briefcase, Calculator, Coins, Gem, Landmark,
  Wallet, Trophy, Medal, CreditCard,
  Users, Mail, MessageSquare, Share2, Smartphone, MapPin, Airplay, Globe2, Satellite,
  Wifi, Map, MessageCircle, Phone,
  Shield, Lock, Settings, Zap, Bell, Check, PlusCircle, Info, ShieldAlert, Key,
  Fingerprint, Wrench, Menu
};
export {
  Cpu, Rocket, BarChart3, Globe, ShieldCheck, HelpCircle,
  Search, X, LayoutGrid, Upload, ImageIcon, History, Trash2, GlobeIcon
};

export const CATEGORIZED_ICONS = [
  {
    category: 'Technology & Infrastructure',
    icon: Cpu,
    icons: [
      { name: 'rocket_launch', type: 'material' }, { name: 'terminal', type: 'material' }, { name: 'database', type: 'material' },
      { name: 'memory', type: 'material' }, { name: 'api', type: 'material' }, { name: 'developer_board', type: 'material' },
      { name: 'architecture', type: 'material' }, { name: 'account_tree', type: 'material' }, { name: 'lan', type: 'material' },
      { name: 'router', type: 'material' }, { name: 'hub', type: 'material' }, { name: 'settings_input_component', type: 'material' },
      { name: 'cloud', type: 'material' }, { name: 'dns', type: 'material' }, { name: 'webhook', type: 'material' },
      { name: 'data_object', type: 'material' }, { name: 'data_array', type: 'material' }, { name: 'schema', type: 'material' },
      { name: 'table_rows', type: 'material' }, { name: 'table_chart', type: 'material' }, { name: 'precision_manufacturing', type: 'material' },
      { name: 'smart_button', type: 'material' }, { name: 'view_quilt', type: 'material' }, { name: 'view_module', type: 'material' }, 
      { name: 'view_in_ar', type: 'material' }, { name: 'sensors', type: 'material' }, { name: 'sensors_off', type: 'material' }, 
      { name: 'fluorescent', type: 'material' }, { name: 'light_mode', type: 'material' }, { name: 'dark_mode', type: 'material' },
      { name: 'settings_suggest', type: 'material' }, { name: 'build_circle', type: 'material' }, { name: 'auto_fix_high', type: 'material' }, 
      { name: 'flash_on', type: 'material' }, { name: 'electric_bolt', type: 'material' }, { name: 'integration_instructions', type: 'material' }, 
      { name: 'app_registration', type: 'material' }, { name: 'sd_card', type: 'material' }, { name: 'sim_card', type: 'material' }, 
      { name: 'battery_0_bar', type: 'material' }, { name: 'network_check', type: 'material' }, { name: 'wifi_tethering', type: 'material' },
      { name: 'bluetooth', type: 'material' }, { name: 'nfc', type: 'material' }, { name: 'troubleshoot', type: 'material' }, 
      { name: 'dynamic_form', type: 'material' }, { name: 'stream', type: 'material' }, { name: 'polyline', type: 'material' }, 
      { name: 'data_thresholding', type: 'material' }, { name: 'storage', type: 'material' }, { name: 'vibration', type: 'material' },
      { name: 'media_bluetooth_on', type: 'material' }, { name: 'settings_ethernet', type: 'material' }, { name: 'settings_input_hdmi', type: 'material' },
      { name: 'settings_input_antenna', type: 'material' }, { name: 'settings_input_svideo', type: 'material' }, { name: 'settings_phone', type: 'material' },
      { name: 'Code', type: 'lucide' }, { name: 'Cpu', type: 'lucide' }, { name: 'Layers', type: 'lucide' }, { name: 'HardDrive', type: 'lucide' },
      { name: 'GitBranch', type: 'lucide' }, { name: 'GitCommit', type: 'lucide' }, { name: 'GitPullRequest', type: 'lucide' },
      { name: 'Binary', type: 'lucide' }, { name: 'Bot', type: 'lucide' }, { name: 'Boxes', type: 'lucide' }, { name: 'CircuitBoard', type: 'lucide' },
      { name: 'Container', type: 'lucide' }, { name: 'Database', type: 'lucide' }, { name: 'FileCode', type: 'lucide' }, { name: 'Microchip', type: 'lucide' }
    ]
  },
  {
    category: 'Biotech & Life Sciences',
    icon: Rocket,
    icons: [
      { name: 'Dna', type: 'lucide' }, { name: 'FlaskConical', type: 'lucide' }, { name: 'Atom', type: 'lucide' }, 
      { name: 'Microscope', type: 'lucide' }, { name: 'Beaker', type: 'lucide' }, { name: 'TestTube', type: 'lucide' },
      { name: 'FlaskRound', type: 'lucide' }, { name: 'Radiation', type: 'lucide' }, { name: 'Biohazard', type: 'lucide' },
      { name: 'Brain', type: 'lucide' }, { name: 'HeartPulse', type: 'lucide' }, { name: 'Thermometer', type: 'lucide' },
      { name: 'Bone', type: 'lucide' }, { name: 'Droplet', type: 'lucide' }, { name: 'Waves', type: 'lucide' },
      { name: 'science', type: 'material' }, { name: 'biotech', type: 'material' }, { name: 'microbiology', type: 'material' },
      { name: 'psychology', type: 'material' }, { name: 'neurology', type: 'material' }, { name: 'vaccines', type: 'material' }, 
      { name: 'health_and_safety', type: 'material' }, { name: 'medical_services', type: 'material' },
      { name: 'medical_information', type: 'material' }, { name: 'clinical_notes', type: 'material' }, { name: 'monitoring', type: 'material' },
      { name: 'eco', type: 'material' }, { name: 'energy_savings_leaf', type: 'material' }, { name: 'solar_power', type: 'material' },
      { name: 'wind_power', type: 'material' }, { name: 'smart_toy', type: 'material' }, { name: 'healing', type: 'material' },
      { name: 'local_hospital', type: 'material' }, { name: 'emergency', type: 'material' }, { name: 'stethoscope', type: 'material' },
      { name: 'prescriptions', type: 'material' }, { name: 'medication', type: 'material' }, { name: 'syringe', type: 'material' },
      { name: 'skeleton', type: 'material' }, { name: 'radiology', type: 'material' }, { name: 'masks', type: 'material' },
      { name: 'bloodtype', type: 'material' }, { name: 'fluid', type: 'material' }, { name: 'opacity', type: 'material' },
      { name: 'water_drop', type: 'material' }, { name: 'coronavirus', type: 'material' }, { name: 'pill', type: 'material' }, 
      { name: 'medication_liquid', type: 'material' }, { name: 'vital_signs', type: 'material' }, { name: 'labs', type: 'material' }, 
      { name: 'conveyor_belt', type: 'material' }, { name: 'genetics', type: 'material' }, { name: 'volcano', type: 'material' }, 
      { name: 'tsunami', type: 'material' }, { name: 'landslide', type: 'material' }, { name: 'forest', type: 'material' },
      { name: 'agriculture', type: 'material' }, { name: 'potted_plant', type: 'material' }, { name: 'nature', type: 'material' },
      { name: 'Stethoscope', type: 'lucide' }, { name: 'Pill', type: 'lucide' }, { name: 'Activity', type: 'lucide' }
    ]
  },
  {
    category: 'Finance & High-Growth',
    icon: BarChart3,
    icons: [
      { name: 'analytics', type: 'material' }, { name: 'monitoring', type: 'material' }, { name: 'dashboard', type: 'material' },
      { name: 'query_stats', type: 'material' }, { name: 'leaderboard', type: 'material' }, { name: 'show_chart', type: 'material' },
      { name: 'stacked_line_chart', type: 'material' }, { name: 'pie_chart', type: 'material' }, { name: 'trending_up', type: 'material' },
      { name: 'trending_down', type: 'material' }, { name: 'trending_flat', type: 'material' }, { name: 'ads_click', type: 'material' },
      { name: 'campaign', type: 'material' }, { name: 'account_balance', type: 'material' }, { name: 'account_balance_wallet', type: 'material' },
      { name: 'monetization_on', type: 'material' }, { name: 'payments', type: 'material' }, { name: 'credit_card', type: 'material' },
      { name: 'receipt_long', type: 'material' }, { name: 'calculate', type: 'material' }, { name: 'percent', type: 'material' },
      { name: 'savings', type: 'material' }, { name: 'work', type: 'material' }, { name: 'business_center', type: 'material' },
      { name: 'domain', type: 'material' }, { name: 'store', type: 'material' }, { name: 'shopping_cart', type: 'material' },
      { name: 'shopping_bag', type: 'material' }, { name: 'inventory', type: 'material' }, { name: 'inventory_2', type: 'material' },
      { name: 'moving', type: 'material' }, { name: 'insights', type: 'material' }, { name: 'legend_toggle', type: 'material' },
      { name: 'auto_graph', type: 'material' }, { name: 'multiline_chart', type: 'material' }, { name: 'area_chart', type: 'material' },
      { name: 'bubble_chart', type: 'material' }, { name: 'scatter_plot', type: 'material' }, { name: 'assessment', type: 'material' },
      { name: 'assignment', type: 'material' }, { name: 'finance_chip', type: 'material' }, { name: 'conversion_path', type: 'material' },
      { name: 'candlestick_chart', type: 'material' }, { name: 'waterfall_chart', type: 'material' }, { name: 'add_chart', type: 'material' },
      { name: 'bar_chart', type: 'material' }, { name: 'donut_large', type: 'material' }, { name: 'euro', type: 'material' },
      { name: 'currency_bitcoin', type: 'material' }, { name: 'currency_exchange', type: 'material' }, { name: 'price_check', type: 'material' },
      { name: 'BarChart', type: 'lucide' }, { name: 'Target', type: 'lucide' }, { name: 'PieChart', type: 'lucide' },
      { name: 'TrendingUp', type: 'lucide' }, { name: 'Briefcase', type: 'lucide' }, { name: 'Calculator', type: 'lucide' },
      { name: 'Coins', type: 'lucide' }, { name: 'Gem', type: 'lucide' }, { name: 'Landmark', type: 'lucide' }, { name: 'Wallet', type: 'lucide' },
      { name: 'Trophy', type: 'lucide' }, { name: 'Medal', type: 'lucide' }, { name: 'CreditCard', type: 'lucide' }
    ]
  },
  {
    category: 'Communication & Global',
    icon: Globe,
    icons: [
      { name: 'public', type: 'material' }, { name: 'language', type: 'material' }, { name: 'translate', type: 'material' },
      { name: 'travel_explore', type: 'material' }, { name: 'flight', type: 'material' }, { name: 'map', type: 'material' },
      { name: 'navigation', type: 'material' }, { name: 'place', type: 'material' }, { name: 'location_on', type: 'material' },
      { name: 'explore', type: 'material' }, { name: 'flag', type: 'material' }, { name: 'share', type: 'material' },
      { name: 'person', type: 'material' }, { name: 'people', type: 'material' }, { name: 'group', type: 'material' },
      { name: 'groups', type: 'material' }, { name: 'person_add', type: 'material' }, { name: 'account_circle', type: 'material' },
      { name: 'manage_accounts', type: 'material' }, { name: 'assignment_ind', type: 'material' }, { name: 'forum', type: 'material' },
      { name: 'chat', type: 'material' }, { name: 'comment', type: 'material' }, { name: 'mail', type: 'material' },
      { name: 'email', type: 'material' }, { name: 'contact_mail', type: 'material' }, { name: 'contact_phone', type: 'material' },
      { name: 'call', type: 'material' }, { name: 'phone_enabled', type: 'material' }, { name: 'videocam', type: 'material' },
      { name: 'notifications', type: 'material' }, { name: 'notifications_active', type: 'material' }, { name: 'school', type: 'material' },
      { name: 'history_edu', type: 'material' }, { name: 'menu_book', type: 'material' }, { name: 'import_contacts', type: 'material' },
      { name: 'connected_tv', type: 'material' }, { name: 'cast', type: 'material' }, { name: 'rss_feed', type: 'material' },
      { name: 'Globe', type: 'lucide' }, { name: 'Users', type: 'lucide' }, { name: 'Mail', type: 'lucide' }, { name: 'MessageSquare', type: 'lucide' },
      { name: 'Share2', type: 'lucide' }, { name: 'Smartphone', type: 'lucide' }, { name: 'MapPin', type: 'lucide' },
      { name: 'Airplay', type: 'lucide' }, { name: 'Globe2', type: 'lucide' }, { name: 'Satellite', type: 'lucide' }, { name: 'Wifi', type: 'lucide' },
      { name: 'Map', type: 'lucide' }, { name: 'MessageCircle', type: 'lucide' }, { name: 'Phone', type: 'lucide' }
    ]
  },
  {
    category: 'Security & Systems',
    icon: ShieldCheck,
    icons: [
      { name: 'security', type: 'material' }, { name: 'verified', type: 'material' }, { name: 'lock', type: 'material' },
      { name: 'lock_open', type: 'material' }, { name: 'key', type: 'material' }, { name: 'vpn_key', type: 'material' },
      { name: 'policy', type: 'material' }, { name: 'privacy_tip', type: 'material' }, { name: 'fingerprint', type: 'material' },
      { name: 'admin_panel_settings', type: 'material' }, { name: 'settings', type: 'material' }, { name: 'build', type: 'material' },
       { name: 'construction', type: 'material' }, { name: 'tune', type: 'material' },
      { name: 'filter_list', type: 'material' }, { name: 'sort', type: 'material' }, { name: 'search', type: 'material' },
      { name: 'zoom_in', type: 'material' }, { name: 'visibility', type: 'material' }, { name: 'delete', type: 'material' },
      { name: 'edit', type: 'material' }, { name: 'content_copy', type: 'material' }, { name: 'content_paste', type: 'material' },
      { name: 'undo', type: 'material' }, { name: 'redo', type: 'material' }, { name: 'refresh', type: 'material' },
      { name: 'sync', type: 'material' }, { name: 'cloud_download', type: 'material' }, { name: 'cloud_upload', type: 'material' },
      { name: 'password', type: 'material' }, { name: 'vpn_lock', type: 'material' }, { name: 'enhanced_encryption', type: 'material' },
      { name: 'gpp_good', type: 'material' }, { name: 'gpp_bad', type: 'material' }, { name: 'shield', type: 'material' },
      { name: 'Shield', type: 'lucide' }, { name: 'Lock', type: 'lucide' }, { name: 'Settings', type: 'lucide' },
      { name: 'Zap', type: 'lucide' }, { name: 'Bell', type: 'lucide' }, { name: 'Check', type: 'lucide' }, { name: 'X', type: 'lucide' },
      { name: 'Trash2', type: 'lucide' }, { name: 'PlusCircle', type: 'lucide' }, { name: 'Info', type: 'lucide' },
      { name: 'ShieldAlert', type: 'lucide' }, { name: 'Key', type: 'lucide' }, { name: 'Fingerprint', type: 'lucide' },
      { name: 'Wrench', type: 'lucide' }, { name: 'Menu', type: 'lucide' }
    ]
  }
];