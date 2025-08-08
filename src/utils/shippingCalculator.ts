
interface ShippingItem {
  product_type?: string;
  quantity?: number | string;
}

export const calculateShipping = (items: ShippingItem[]): number => {
  let totalShipping = 0;

  for (const item of items) {
    const productType = item.product_type || 'ETC';
    let shippingCost = 0;
    
    switch (productType) {
      case 'Keyring/Keychain':
      case 'Keychain':
      case 'Keyring':
        shippingCost = 35;
        break;
      case 'Mini Figure':
        shippingCost = 50;
        break;
      case 'Big Figure/Statue':
      case 'Big Figure':
      case 'Big Statue':
        shippingCost = 0; // ส่งฟรี
        break;
      case 'Medium Figure/Statue':
      case 'Medium Figure':
      case 'Medium Statue':
        shippingCost = 80;
        break;
      case 'Plush':
        shippingCost = 40;
        break;
      case 'Standee':
        shippingCost = 35;
        break;
      case 'Clothing & Accessories':
      case 'Clothing':
      case 'Accessories':
        shippingCost = 40;
        break;
      default:
        shippingCost = 50; // ETC และอื่นๆ
        break;
    }
    
    // Ensure quantity is a valid non-negative number to avoid NaN in totals
    const quantity = Number(item.quantity);
    totalShipping += shippingCost * (isNaN(quantity) ? 1 : Math.max(0, quantity));
  }
  
  return totalShipping;
};
