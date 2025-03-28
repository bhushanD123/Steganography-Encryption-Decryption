document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const encryptTab = document.getElementById('encryptTab');
    const decryptTab = document.getElementById('decryptTab');
    const encryptContent = document.getElementById('encryptContent');
    const decryptContent = document.getElementById('decryptContent');

    encryptTab.addEventListener('click', () => {
        encryptTab.classList.add('bg-blue-500', 'text-white');
        encryptTab.classList.remove('bg-gray-300');
        decryptTab.classList.add('bg-gray-300');
        decryptTab.classList.remove('bg-blue-500', 'text-white');
        encryptContent.classList.add('active');
        decryptContent.classList.remove('active');
    });

    decryptTab.addEventListener('click', () => {
        decryptTab.classList.add('bg-blue-500', 'text-white');
        decryptTab.classList.remove('bg-gray-300');
        encryptTab.classList.add('bg-gray-300');
        encryptTab.classList.remove('bg-blue-500', 'text-white');
        decryptContent.classList.add('active');
        encryptContent.classList.remove('active');
    });

    // Steganography functions
    const encryptBtn = document.getElementById('encryptBtn');
    const decryptBtn = document.getElementById('decryptBtn');
    const encryptImage = document.getElementById('encryptImage');
    const decryptImage = document.getElementById('decryptImage');
    const secretMessage = document.getElementById('secretMessage');
    const messageOutput = document.getElementById('messageOutput');
    const extractedMessage = document.getElementById('extractedMessage');

    encryptBtn.addEventListener('click', hideMessage);
    decryptBtn.addEventListener('click', extractMessage);

    function hideMessage() {
        const file = encryptImage.files[0];
        const message = secretMessage.value.trim();

        if (!file) {
            alert('Please select an image file');
            return;
        }

        if (!message) {
            alert('Please enter a secret message');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const binaryMessage = textToBinary(message + '\0'); // Null terminator

                if (binaryMessage.length > data.length * 0.25) {
                    alert('Message is too large for this image. Try a smaller message or larger image.');
                    return;
                }

                // Hide message in LSB
                for (let i = 0; i < binaryMessage.length; i++) {
                    const pixelIndex = i * 4;
                    if (pixelIndex >= data.length) break;
                    
                    // Modify the least significant bit of the red channel
                    data[pixelIndex] = (data[pixelIndex] & 0xFE) | parseInt(binaryMessage[i]);
                }

                ctx.putImageData(imageData, 0, 0);
                
                // Create download link
                const encryptedImage = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = 'encrypted-image.png';
                link.href = encryptedImage;
                link.click();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function extractMessage() {
        const file = decryptImage.files[0];

        if (!file) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                let binaryMessage = '';

                // Extract message from LSB
                for (let i = 0; i < data.length; i += 4) {
                    const lsb = data[i] & 1;
                    binaryMessage += lsb.toString();
                }

                const message = binaryToText(binaryMessage);
                if (message) {
                    messageOutput.textContent = message;
                    extractedMessage.classList.remove('hidden');
                } else {
                    alert('No hidden message found in this image');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Helper functions
    function textToBinary(text) {
        return text.split('').map(char => {
            return char.charCodeAt(0).toString(2).padStart(8, '0');
        }).join('');
    }

    function binaryToText(binary) {
        let text = '';
        for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.substr(i, 8);
            if (byte.length < 8) break;
            const charCode = parseInt(byte, 2);
            if (charCode === 0) break; // Stop at null terminator
            text += String.fromCharCode(charCode);
        }
        return text;
    }
});