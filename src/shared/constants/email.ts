/**
 * Lista de dominios de correos temporales/desechables bloqueados
 * Actualizada regularmente para prevenir el registro con correos temporales
 */
export const BLOCKED_EMAIL_DOMAINS = [
    // Servicios de correo temporal más comunes
    'yopmail.com', 'mailinator.com', '10minutemail.com', 'tempmail.com', 
    'guerrillamail.com', 'throwawaymail.com', 'maildrop.cc', 'fakeinbox.com',
    'temp-mail.org', 'dispostable.com', 'getnada.com', 'mohmal.com',
    'sharklasers.com', 'grr.la', 'guerrillamail.info', 'guerrillamail.biz',
    'guerrillamail.net', 'guerrillamail.org', 'guerrillamailblock.com',
    'pokemail.net', 'spam4.me', 'bccto.me', 'chacuo.net', 'devnullmail.com',
    'e4ward.com', 'emailmiser.com', 'emailsensei.com', 'emailwarden.com',
    'ephemail.net', 'fastmail.fm', 'filzmail.com', 'getonemail.com',
    'haltospam.com', 'imails.info', 'incognitomail.org', 'jetable.org',
    'koszmail.pl', 'kulturbetrieb.info', 'kurzepost.de', 'lroid.com',
    'mail-temporaire.fr', 'mail4trash.com', 'mailbidon.com', 'mailcatch.com',
    'maileater.com', 'mailexpire.com', 'mailfall.com', 'mailforspam.com',
    'mailin8r.com', 'mailinater.com', 'mailme.lv', 'mailmetrash.com',
    'mailmoat.com', 'mailnull.com', 'mailshell.com', 'mailsiphon.com',
    'mailtemp.info', 'mailtothis.com', 'mailzilla.com', 'makemetheking.com',
    'mintemail.com', 'mt2009.com', 'mytempemail.com', 'netzidiot.de',
    'nobulk.com', 'noclickemail.com', 'nogmailspam.info', 'nomail.xl.cx',
    'nomail2me.com', 'nospam.ze.tc', 'nospam4.us', 'nospamfor.us',
    'nowmymail.com', 'objectmail.com', 'obobbo.com', 'one-time.email',
    'oneoffmail.com', 'onewaymail.com', 'opayq.com', 'ordinaryamerican.net',
    'otherinbox.com', 'ourklips.com', 'outlawspam.com', 'ovpn.to',
    'owlpic.com', 'pancakemail.com', 'pcusers.otherinbox.com', 'pjklife.com',
    'plexolan.de', 'pookmail.com', 'proxymail.eu', 'putthisinyourspamdatabase.com',
    'quickinbox.com', 'rcpt.at', 're-gister.com', 'receiveee.com',
    'recycleinbox.com', 'regbypass.com', 'rmqkr.net', 's0ny.net',
    'safe-mail.net', 'safetymail.info', 'sandelf.de', 'saynotospams.com',
    'selfdestructingmail.com', 'sendspamhere.com', 'shiftmail.com',
    'skeefmail.com', 'slopsbox.com', 'smellfear.com', 'snakemail.com',
    'sneakemail.com', 'snkmail.com', 'sogetthis.com', 'soodonims.com',
    'spam.la', 'spamavert.com', 'spambob.net', 'spambob.org',
    'spambog.com', 'spambog.de', 'spambog.ru', 'spambox.us',
    'spamcannon.com', 'spamcannon.net', 'spamcon.org', 'spamcorptastic.com',
    'spamcowboy.com', 'spamcowboy.net', 'spamcowboy.org', 'spamday.com',
    'spamex.com', 'spamfree24.com', 'spamfree24.de', 'spamfree24.eu',
    'spamfree24.net', 'spamfree24.org', 'spamgoes.com', 'spamgourmet.com',
    'spamgourmet.net', 'spamgourmet.org', 'spamhole.com', 'spamify.com',
    'spaminator.de', 'spamkill.info', 'spaml.com', 'spaml.de',
    'spammotel.com', 'spamobox.com', 'spamspot.com', 'spamthis.co.uk',
    'spamthisplease.com', 'spamtroll.net', 'speed.1s.fr', 'super-auswahl.de',
    'supergreatmail.com', 'supermailer.jp', 'superrito.com', 'superstachel.de',
    'suremail.info', 'tagyourself.com', 'teewars.org', 'teleworm.com',
    'teleworm.us', 'tempalias.com', 'tempe-mail.com', 'tempemail.biz',
    'tempemail.com', 'tempinbox.co.uk', 'tempinbox.com', 'tempmail.eu',
    'tempmaildemo.com', 'tempmailer.com', 'tempmailer.de', 'tempomail.fr',
    'temporarily.de', 'temporarioemail.com.br', 'temporaryemail.net',
    'temporaryemail.us', 'temporaryforwarding.com', 'temporaryinbox.com',
    'temporarymailaddress.com', 'tempthe.net', 'thanksnospam.info',
    'thankyou2010.com', 'thecloudindex.com', 'thisisnotmyrealemail.com',
    'thismail.net', 'throwam.com', 'tilien.com', 'tmail.ws',
    'tmailinator.com', 'toiea.com', 'tradermail.info', 'trash-amil.com',
    'trash-mail.at', 'trash-mail.com', 'trash-mail.de', 'trash2009.com',
    'trashdevil.com', 'trashdevil.de', 'trashemail.de', 'trashmail.at',
    'trashmail.com', 'trashmail.de', 'trashmail.me', 'trashmail.net',
    'trashmail.org', 'trashmail.ws', 'trashmailer.com', 'trashymail.com',
    'tyldd.com', 'uggsrock.com', 'uroid.com', 'us.af', 'venompen.com',
    'veryrealemail.com', 'viditag.com', 'viewcastmedia.com', 'viewcastmedia.net',
    'viewcastmedia.org', 'walkmail.net', 'wetrainbayarea.com', 'wetrainbayarea.org',
    'wh4f.org', 'whyspam.me', 'willselfdestruct.com', 'winemaven.info',
    'wronghead.com', 'wuzupmail.net', 'www.e4ward.com', 'www.gishpuppy.com',
    'www.mailinator.com', 'wwwnew.eu', 'x.ip6.li', 'xagloo.com',
    'xemaps.com', 'xents.com', 'xmaily.com', 'xoxy.net',
    'yapped.net', 'yepmail.net', 'yogamaven.com', 'yopmail.fr',
    'yopmail.net', 'ypmail.webredirect.org', 'za.com', 'zehnminutenmail.de',
    'zetmail.com', 'zoaxe.com', 'zoemail.org'
  ] as const;
  
  /**
   * Dominios de correo recomendados y populares
   */
  export const RECOMMENDED_EMAIL_DOMAINS = [
    'gmail.com',
    'hotmail.com',
    'outlook.com',
    'yahoo.com',
    'yahoo.es',
    'icloud.com',
    'protonmail.com',
    'live.com',
    'msn.com',
    'terra.com.co',
    'une.net.co',
    'etb.net.co',
    'colombia.com',
    'latinmail.com'
  ] as const;
  
  /**
   * Función para verificar si un dominio de email está bloqueado
   * @param email - El email completo a verificar
   * @returns true si el dominio está permitido, false si está bloqueado
   */
  export const isValidEmailDomain = (email: string): boolean => {
    const domain = email.toLowerCase().split('@')[1];
    return !BLOCKED_EMAIL_DOMAINS.includes(domain);
  };
  
  /**
   * Función para verificar si un email usa un dominio temporal
   * @param email - El email a verificar
   * @returns true si es temporal, false si no
   */
  export const isTemporaryEmail = (email: string): boolean => {
    const domain = email.toLowerCase().split('@')[1];
    return BLOCKED_EMAIL_DOMAINS.includes(domain);
  };
  
  /**
   * Obtiene una lista de dominios de email recomendados
   * @returns Array de dominios recomendados
   */
  export const getRecommendedEmailDomains = (): readonly string[] => {
    return RECOMMENDED_EMAIL_DOMAINS;
  };
  