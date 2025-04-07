import React from 'react';

function XcalaLogo() {
  return (
    <svg 
      preserveAspectRatio="xMidYMid meet" 
      viewBox="16.422 16.422 93.062 40.163" 
      height="32" 
      width="54" 
      role="img"
      aria-label="Xcala logo"
    >
      <g>
        <path fill="#1E22AA" d="M34.266 43.187h-4.454v-4.455h4.454v4.455Z" />
        <path fill="#1E22AA" d="M56.495 25.262h-8.84v-8.84h8.84v8.84Z" />
        <path fill="#1E22AA" d="M23.853 38.726h5.96v-5.96h-5.96v5.96Z" />
        <path fill="#1E22AA" d="M34.263 38.726h5.961v-5.96h-5.96v5.96Z" />
        <path fill="#1E22AA" d="M40.227 43.178H34.26v5.966h5.966v-5.966Z" />
        <path fill="#1E22AA" d="M47.673 49.136h-7.448v7.449h7.448v-7.449Z" />
        <path fill="#1E22AA" d="M23.862 43.192h5.961v5.961h-5.96v-5.96Z" />
        <path fill="#1E22AA" d="M16.422 49.13h7.438v7.439h-7.438V49.13Z" />
        <path fill="#1E22AA" d="M16.422 25.265h7.438v7.439h-7.438v-7.439Z" />
        <path fill="#1E22AA" d="M40.233 25.265h7.438v7.439h-7.438v-7.439Z" />
        <path fill="#101820" d="M55.714 32.652c3.95 0 6.524 1.96 7.43 5.354h-3.598c-.556-1.55-1.843-2.545-3.832-2.545-2.692 0-4.476 1.989-4.476 5.5 0 3.54 1.784 5.529 4.476 5.529 1.99 0 3.218-.878 3.832-2.546h3.599c-.907 3.16-3.482 5.354-7.431 5.354-4.623 0-7.9-3.276-7.9-8.337 0-5.032 3.277-8.31 7.9-8.31Z" />
        <path fill="#101820" d="M74.751 35.548c-2.486 0-4.886 1.873-4.886 5.354s2.4 5.5 4.886 5.5c2.516 0 4.886-1.96 4.886-5.441 0-3.453-2.37-5.413-4.886-5.413Zm-.702-2.896c2.72 0 4.593 1.287 5.588 2.604v-2.34h3.364v16.331h-3.364v-2.61c-1.024 1.374-2.955 2.662-5.646 2.662-4.184 0-7.548-3.423-7.548-8.397 0-4.973 3.364-8.25 7.606-8.25Z" />
        <path fill="#101820" d="M87.236 26.458h3.335v22.79h-3.335v-22.79Z" />
        <path fill="#101820" d="M101.234 35.548c-2.487 0-4.886 1.873-4.886 5.354s2.399 5.5 4.886 5.5c2.516 0 4.885-1.96 4.885-5.441 0-3.453-2.369-5.413-4.885-5.413Zm-.703-2.896c2.721 0 4.593 1.287 5.588 2.604v-2.34h3.365v16.331h-3.365v-2.61c-1.024 1.374-2.955 2.662-5.646 2.662-4.184 0-7.548-3.423-7.548-8.397 0-4.973 3.364-8.25 7.606-8.25Z" />
      </g>
    </svg>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a 
      href={href} 
      className="relative text-gray-600 hover:text-gray-900 py-6 group"
    >
      {children}
      <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-700 transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
    </a>
  );
}

function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <XcalaLogo />
            </a>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="#">Home</NavLink>
            <NavLink href="#">Quienes Somos</NavLink>
            <NavLink href="#">Blog</NavLink>
            <NavLink href="#">Portfolio</NavLink>
            <NavLink href="#">Fondos</NavLink>
            <NavLink href="#">Como Funciona</NavLink>
            <NavLink href="#">FAQ</NavLink>
            <button className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition font-medium">
              Regístrate
            </button>
            <button className="text-gray-600 hover:text-gray-900 font-medium">
              Ingreso
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;