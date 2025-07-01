export const getRandomBarcode = (): string => {
  const demoBarcodes = ['SCAL001', 'FORC001', 'RETR001', 'SCAL002', 'FORC002'];
  return demoBarcodes[Math.floor(Math.random() * demoBarcodes.length)];
};
