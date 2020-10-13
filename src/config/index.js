export const Keys = async () => {
    if (process.env.NODE_ENV === 'production') {
        const prodKeys = await import('./prod.js');
        return prodKeys.keys;
    } else {
        const devKeys = await import('./dev.js');
        return devKeys.keys;
    }
};
