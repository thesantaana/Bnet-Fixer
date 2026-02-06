// Tailwind CSS Configuration
tailwind.config = {
    theme: {
        extend: {
            colors: {
                bnet: {
                    dark: '#151a21',
                    card: '#1c222b',
                    blue: '#0074e0',
                    blueHover: '#005bb5',
                    text: '#e5e7eb'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        }
    }
}

// FAQ Toggle Function
function toggleFaq(id) {
    const answer = document.getElementById(`answer-${id}`);
    const icon = document.getElementById(`icon-${id}`);
    
    if (answer.classList.contains('hidden')) {
        answer.classList.remove('hidden');
        icon.classList.add('rotate-180');
    } else {
        answer.classList.add('hidden');
        icon.classList.remove('rotate-180');
    }
}