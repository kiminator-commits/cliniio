export const getRandomBarcode = (): string => {
  const demoBarcodes = ['SCAL001', 'FORC001', 'RETR001', 'SCAL002', 'FORC002'];
  return demoBarcodes[Math.floor(Math.random() * demoBarcodes.length)];
};

export const getRandomRoomBarcode = (): string => {
  const roomBarcodes = [
    'OR001',
    'ICU101',
    'SUP001',
    'ER001',
    'LAB001',
    'RAD001',
    'PHY001',
    'ADM001',
  ];
  return roomBarcodes[Math.floor(Math.random() * roomBarcodes.length)];
};
