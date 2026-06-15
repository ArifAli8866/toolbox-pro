import Link from "next/link";
import { Wrench } from "lucide-react";

const toolLinks = [
  { href: '/converter', label: 'File Converter' },
  { href: '/compressor', label: 'File Compressor' },
  { href: '/image-tools', label: 'Image AI Tools' },
  { href: '/more-tools', label: 'More Tools' },
  { href: '/utilities', label: 'Utilities' },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold">
                <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">ToolBox</span>
                <span className="text-brand-400 text-xs font-bold ml-0.5">PRO</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Free online tools for file conversion, compression, media downloading, and more. All processing happens in your browser.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-4">Tools</h4>
            <ul className="space-y-2.5">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-500 hover:text-brand-600 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-slate-500 hover:text-brand-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-brand-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-brand-600 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-4">Contact</h4>
            <ul className="space-y-2.5">
              <li><a href="https://www.linkedin.com/in/arif-ali-23a38032a/" className="text-sm text-slate-500 hover:text-brand-600 transition-colors">Support</a></li>
              <li><a href="https://github.com/ArifAli8866" className="text-sm text-slate-500 hover:text-brand-600 transition-colors">GitHub</a></li>
              <li><a href="https://x.com/arifali8866" className="text-sm text-slate-500 hover:text-brand-600 transition-colors">Twitter</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">© 2026 ToolBox Pro. All rights reserved.</p>
          <p className="text-sm text-slate-400 flex items-center gap-1">
            Made with <span className="text-red-500">♥</span> Arif Ali — All processing in your browser
          </p>
        </div>
      </div>
    </footer>
  );
}
