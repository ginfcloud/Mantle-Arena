// place files you want to import through the `$lib` alias in this folder.
export function emitRightText(value, numberChar) {
    // Convert value to string if it's a number
    value = value.toString();

    if (value.length > numberChar) {
        value = value.slice(0, numberChar) + "...";
    }
    return value;
};
export function emitBetweenText(value, numberChar) {
    // Convert value to string if it's a number
    if(!value){
      return
    }
    value = value.toString();

    if (value.length > numberChar) {
        value = value.slice(0, 5) + "..." + value.slice(value.length - 5, value.length);
    }
    return value;
}

export function bigIntToFloat(number) {
    const natural = number / 10n ** 18n;
    const decimal = number % 10n ** 18n;

    return parseFloat(natural.toString() + "." + decimal.toString().padStart(18, "0"));
}

//Convert number
export function roundNum(num, decimals) {
    // Convert the number to the desired number of decimal places
    let str = num.toFixed(decimals);
    let str2;
    // Remove trailing zeros
    str2 = str.replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');
    str2 = str2;
    return str2;
  }

export function getAddressColor(address) {
    if (!address) return 'linear-gradient(135deg, #666666, #888888)';
    
    // Create hash from address
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
        const char = address.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    // Generate multiple color stops for gradient
    const hash1 = Math.abs(hash);
    const hash2 = Math.abs(hash >> 8);
    const hash3 = Math.abs(hash >> 16);
    
    // Use HSL for better color distribution
    const hue1 = hash1 % 360;
    const hue2 = (hash2 % 360);
    const hue3 = (hash3 % 360);
    
    const saturation = 70 + (hash1 % 30); // 70-100%
    const lightness = 45 + (hash2 % 20);  // 45-65%
    
    const color1 = `hsl(${hue1}, ${saturation}%, ${lightness}%)`;
    const color2 = `hsl(${hue2}, ${saturation + 10}%, ${lightness + 10}%)`;
    const color3 = `hsl(${hue3}, ${saturation - 10}%, ${lightness - 5}%)`;
    
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;
}

export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
    }
}

  // Caculate time ago
export function timeAgo(timeCreated) {
    const now = Date.now(); // Current time in milliseconds
    const difference = now - timeCreated; // Difference in milliseconds
  
    // Convert difference to different units
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    // Rough approximation for months and years, more accurate calculation could be done with Date objects
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
  
    // Format the output
    if (seconds < 60) {
      return `${seconds} seconds ago`;
    } else if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else if (days < 7) {
      return `${days} days ago`;
    } else if (weeks < 4) {
      return `${weeks} weeks ago`;
    } else if (months < 12) {
      return `${months} months ago`;
    } else {
      return `${years} years ago`;
    }
  }


  export function formatTimeLeft(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalWeeks = Math.floor(totalDays / 7);

    if (totalDays >= 7) {
    return `${totalWeeks} weeks ${totalDays % 7} days`;
    } else if (totalDays < 7 && totalDays >= 1) {
    return `${totalDays} days ${totalHours % 24} hours`;
    } else if (totalDays < 1) {
    return `${totalHours} hours ${totalMinutes % 60} minutes`;
    }
}