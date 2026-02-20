/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		'./pages/**/*.{js,jsx}',
		'./components/**/*.{js,jsx}',
		'./app/**/*.{js,jsx}',
		'./src/**/*.{js,jsx}',
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				hygenious: {
					teal: '#00D4AA',
					cyan: '#06B6D4',
					blue: '#3B82F6',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-hero': 'linear-gradient(135deg, rgba(0, 212, 170, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
				'gradient-mesh': 'radial-gradient(at 30% 20%, rgba(0, 212, 170, 0.12) 0%, transparent 50%), radial-gradient(at 80% 60%, rgba(59, 130, 246, 0.12) 0%, transparent 50%), radial-gradient(at 50% 90%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)',
				'gradient-success': 'linear-gradient(135deg, #10B981 0%, #00D4AA 100%)',
				'gradient-premium': 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.9) 100%)',
			},
			boxShadow: {
				'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
				'md': '0 4px 12px rgba(0, 0, 0, 0.08)',
				'lg': '0 12px 40px rgba(0, 0, 0, 0.12)',
				'xl': '0 24px 64px rgba(0, 0, 0, 0.15)',
				'glow': '0 0 40px rgba(0, 212, 170, 0.25)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'gradient-flow': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'gradient-flow-reverse': {
					'0%, 100%': { backgroundPosition: '100% 50%' },
					'50%': { backgroundPosition: '0% 50%' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'gradient-flow': 'gradient-flow 20s ease infinite',
				'gradient-flow-reverse': 'gradient-flow-reverse 25s ease infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}