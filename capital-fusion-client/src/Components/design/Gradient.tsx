export const GradientLight = () => {
    return (
        <div
            className="position-absolute top-0 w-100 pointer-events-none"
            style={{
                left: '70%',
                aspectRatio: '1/1',
                width: '20%',
                background: 'radial-gradient(circle, #28206c 0%, rgba(40,32,108,0)70%)',
                zIndex: 10,
            }}
        >
        </div>
    );
};
