export interface TokenPayload {
    userId: number;
    role: string;
    iat: number;
    exp: number;
  }
  
  /**
   * Decodifica un JWT token sin verificar la firma
   */
  export const decodeToken = (token: string): TokenPayload | null => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      return null;
    }
  };
  
  /**
   * Verifica si un token está expirado
   * @param token - JWT token
   * @param bufferMinutes - Minutos de buffer antes de la expiración (default: 2)
   */
  export const isTokenExpired = (token: string, bufferMinutes: number = 2): boolean => {
    const decoded = decodeToken(token);
    if (!decoded?.exp) return true;
  
    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = bufferMinutes * 60;
    
    return decoded.exp <= (currentTime + bufferTime);
  };
  
  /**
   * Obtiene el tiempo restante del token en segundos
   */
  export const getTokenTimeRemaining = (token: string): number => {
    const decoded = decodeToken(token);
    if (!decoded?.exp) return 0;
  
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - currentTime);
  };
  
  /**
   * Formatea el tiempo restante en formato legible
   */
  export const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Expirado';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };
  