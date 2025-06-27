import {useEffect, useRef} from 'react';

function useOutsideClick(callback: (element: HTMLElement) => void) {
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback(event.target as HTMLElement);
            }
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [callback]);

    return ref;
}

export default useOutsideClick;
