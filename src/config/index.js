export const Keys = async () => {
    const file =
        process.env.NODE_ENV === 'production' ? './prod.js' : './dev.js';

    const module = await import(file);
    return module.keys;
};
