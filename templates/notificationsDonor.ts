import { sendEmailNotification } from "../src/helpers/emailNotification.Helper";

export class NotificationDonor {
    static async cnd01(organization: any) {
    const subject = "Notificación CND-01";
    const donorName = organization.representativaName || "Donante";
    const emailBody: string = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notificación CND-01</title>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #FFFFFF;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #767676;
            color: #FFFFFF;
            padding: 10px 50px;
            border-radius: 5px;
            max-width: 600px;
            margin: 20px auto;
        }

        .logo {
            display: flex;
            align-items: center;
        }

        .logo img {
            margin-right: 15px;
            width: 180px;
            height: auto;
        }

        .notification-text {
            font-size: 25px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: right;
            font-family: "Comic Sans MS", cursive;
        }

        .content {
            max-width: 600px;
            margin: 20px auto;
            font-size: 14px;
            line-height: 1.6;
            color: #000000;
            font-family: "Comic Sans MS", cursive;
        }

        .footer {
            max-width: 600px;
            margin: 40px auto;
            text-align: center;
            background-color: #E3096A;
            color: #FFFFFF;
            padding: 30px 50px;
            border-radius: 5px;
        }

        .footer span {
            display: block;
            font-family: "Comic Sans MS", cursive;
            font-size: 18px;
        }

        .footer a {
            color: #FFFFFF;
            text-decoration: none;
        }
    </style>
</head>

<body>
    <div class="header">
        <div class="logo">
            <img src="https://storage-masivdrive.masivapp.com/16543/6b9388c0-587d-4f7d-a1c4-34341cb75fc6.png"
                alt="Logo">
        </div>
        <div class="notification-text">
            <p>NOTIFICACIÓN</p>
        </div>
    </div>

    <div class="content">
        <p>Hola, ${donorName}</p>

        <p>¡Felicitaciones! Tu registro en
            GiveSharingFood ha sido revisado y aprobado con éxito.</p>

        <p>Ahora puedes iniciar sesió n en
            nuestro portal y comenzar a explorar opciones para donar alimentos.
        </p>

        <p>Haz clic aquí.</p>

        <p><a href="https://givesharingfood.azurewebsites.net/login">https://givesharingfood.azurewebsites.net/login</a>
        </p>

        <p>&nbsp;</p>

        <p>Gracias por unirte a nuestra
            comunidad y por tu compromiso con ayudar a quienes má s lo necesitan.
        </p>

        <p>¡Juntos podemos hacer una gran
            diferencia!</p>

        <p>¡Hasta pronto!</p>

        <p>&nbsp;</p>
    </div>
    <div class="footer">
        <span>¿Necesitas ayuda? Contáctanos</span>
        <span><a href="mailto:givesharingfood@gmail.com">givesharingfood@gmail.com</a></span>
    </div>
</body>

</html>`;
    await sendEmailNotification(subject,
    "Nueva Organización",
    [organization.email],
    emailBody
);
  }

  static async cnd02(product: any){
    const subject = "Notificación CND-02";
    const donorName = product.attendantName || "Donante";
    const products = product.productName || "Producto";
    const emailBody: string = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notificación CND-02</title>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #FFFFFF;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #767676;
            color: #FFFFFF;
            padding: 10px 50px;
            border-radius: 5px;
            max-width: 600px;
            margin: 20px auto;
        }

        .logo {
            display: flex;
            align-items: center;
        }

        .logo img {
            margin-right: 15px;
            width: 180px;
            height: auto;
        }

        .notification-text {
            font-size: 25px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: right;
            font-family: "Comic Sans MS", cursive;
        }

        .content {
            max-width: 600px;
            margin: 20px auto;
            font-size: 14px;
            line-height: 1.6;
            color: #000000;
            font-family: "Comic Sans MS", cursive;
        }

        .footer {
            max-width: 600px;
            margin: 40px auto;
            text-align: center;
            background-color: #E3096A;
            color: #FFFFFF;
            padding: 30px 50px;
            border-radius: 5px;
        }

        .footer span {
            display: block;
            font-family: "Comic Sans MS", cursive;
            font-size: 18px;
        }

        .footer a {
            color: #FFFFFF;
            text-decoration: none;
        }
    </style>
</head>

<body>
    <div class="header">
        <div class="logo">
            <img src="https://storage-masivdrive.masivapp.com/16543/6b9388c0-587d-4f7d-a1c4-34341cb75fc6.png"
                alt="Logo">
        </div>
        <div class="notification-text">
            <p>NOTIFICACIÓN</p>
        </div>
    </div>

    <div class="content">
        <p>Hola, ${donorName} </p>

        <p>&nbsp;</p>

        <p>¡Te confirmamos que tu oferta de
            donación de ${products} ha sido registrada exitosamente en nuestra plataforma!
        </p>

        <p> &nbsp;</p>

        <p>¡Tu donación está en camino! La
            estamos gestionando para que llegue a quienes más lo necesitan. Te notificaremos
            cualquier novedad. Puedes seguir el progreso en tu perfil. </p>

        <p>Haz clic aquí.</p>

        <p><a href="https://givesharingfood.azurewebsites.net/login">https://givesharingfood.azurewebsites.net/login</a>
        </p>

        <p>¡Juntos podemos hacer una gran
            diferencia! </p>

        <p>¡Hasta pronto!</p>

        <p>&nbsp;</p>
    </div>
    <div class="footer">
        <span>¿Necesitas ayuda? Contáctanos</span>
        <span><a href="mailto:givesharingfood@gmail.com">givesharingfood@gmail.com</a></span>
    </div>
</body>

</html>`;
    await sendEmailNotification(subject,
        "Nuevo Producto",
        [product.attendantEmail],
        emailBody
    )
  }

  static async cnd03(product: any){
    const subject = "Notificación CND-03";
    const donorName = product.attendantName;
    const fundationName = product.bussisnesName;
    const productsReserved = product.productName || "Producto";
    const emailBody: string = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notificación CND-03</title>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #FFFFFF;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #767676;
            color: #FFFFFF;
            padding: 10px 50px;
            border-radius: 5px;
            max-width: 600px;
            margin: 20px auto;
        }

        .logo {
            display: flex;
            align-items: center;
        }

        .logo img {
            margin-right: 15px;
            width: 180px;
            height: auto;
        }

        .notification-text {
            font-size: 25px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: right;
            font-family: "Comic Sans MS", cursive;
        }

        .content {
            max-width: 600px;
            margin: 20px auto;
            font-size: 14px;
            line-height: 1.6;
            color: #000000;
            font-family: "Comic Sans MS", cursive;
        }

        .footer {
            max-width: 600px;
            margin: 40px auto;
            text-align: center;
            background-color: #E3096A;
            color: #FFFFFF;
            padding: 30px 50px;
            border-radius: 5px;
        }

        .footer span {
            display: block;
            font-family: "Comic Sans MS", cursive;
            font-size: 18px;
        }

        .footer a {
            color: #FFFFFF;
            text-decoration: none;
        }
    </style>
</head>

<body>
    <div class="header">
        <div class="logo">
            <img src="https://storage-masivdrive.masivapp.com/16543/6b9388c0-587d-4f7d-a1c4-34341cb75fc6.png"
                alt="Logo">
        </div>
        <div class="notification-text">
            <p>NOTIFICACIÓN</p>
        </div>
    </div>

    <div class="content">
        <p>Hola, ${donorName} </p>

        <p>&nbsp;</p>

        <p>¡Buenas noticias! Nos complace
            informarte que la fundación ${fundationName} se ha interesado en tu
            oferta de ${productsReserved} y ha reservado con éxito la donación. </p>

        <p>En breve, la fundación se pondrá en
            contacto contigo para coordinar los detalles de la entrega. </p>

        <p>¡Muchas gracias por tu generosidad!
            Puedes seguir el progreso en tu perfil. </p>

        <p>Haz clic aquí .</p>

        <p><a href="https://givesharingfood.azurewebsites.net/login">https://givesharingfood.azurewebsites.net/login</a>
        </p>

        <p>¡Juntos podemos hacer una gran
            diferencia! </p>

        <p>¡Hasta pronto!</p>

        <p>&nbsp;</p>
    </div>
    <div class="footer">
        <span>¿Necesitas ayuda? Contáctanos</span>
        <span><a href="mailto:givesharingfood@gmail.com">givesharingfood@gmail.com</a></span>
    </div>
</body>

</html>`;
    await sendEmailNotification(subject, "Producto Reservado", [product.attendantEmail], emailBody);
  }

  static async cnd04(product: any){
    const subject = "Notificación CND-04";
    const donorName = product.attendantName;
    const fundationName = product.bussisnesName;
    const emailBody: string = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notificación CND-04</title>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #FFFFFF;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #767676;
            color: #FFFFFF;
            padding: 10px 50px;
            border-radius: 5px;
            max-width: 600px;
            margin: 20px auto;
        }

        .logo {
            display: flex;
            align-items: center;
        }

        .logo img {
            margin-right: 15px;
            width: 180px;
            height: auto;
        }

        .notification-text {
            font-size: 25px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: right;
            font-family: "Comic Sans MS", cursive;
        }

        .content {
            max-width: 600px;
            margin: 20px auto;
            font-size: 14px;
            line-height: 1.6;
            color: #000000;
            font-family: "Comic Sans MS", cursive;
        }

        .footer {
            max-width: 600px;
            margin: 40px auto;
            text-align: center;
            background-color: #E3096A;
            color: #FFFFFF;
            padding: 30px 50px;
            border-radius: 5px;
        }

        .footer span {
            display: block;
            font-family: "Comic Sans MS", cursive;
            font-size: 18px;
        }

        .footer a {
            color: #FFFFFF;
            text-decoration: none;
        }
    </style>
</head>

<body>
    <div class="header">
        <div class="logo">
            <img src="https://storage-masivdrive.masivapp.com/16543/6b9388c0-587d-4f7d-a1c4-34341cb75fc6.png"
                alt="Logo">
        </div>
        <div class="notification-text">
            <p>NOTIFICACIÓN</p>
        </div>
    </div>

    <div class="content">
        <p>Hola, ${donorName} </p>

        <p>¡Felicitaciones! Te confirmamos que
            la entrega de tu donación a la fundación ${fundationName} se ha
            realizado con éxito.</p>

        <p>Ahora, la fundación procederá a
            emitir el certificado de donación. Te mantendremos informado una vez que
            tengamos este documento. </p>

        <p>¡Muchas gracias por tu generosa
            contribución! Puedes seguir el progreso en tu perfil.</p>

        <p>Haz clic aquí .</p>

        <p><a href="https://givesharingfood.azurewebsites.net/login">https://givesharingfood.azurewebsites.net/login</a>
        </p>

        <p>¡Juntos podemos hacer una gran
            diferencia! </p>

        <p>¡Hasta pronto!</p>

        <p>&nbsp;</p>
    </div>
    <div class="footer">
        <span>¿Necesitas ayuda? Contáctanos</span>
        <span><a href="mailto:givesharingfood@gmail.com">givesharingfood@gmail.com</a></span>
    </div>
</body>

</html>`;
    await sendEmailNotification(subject, "Producto Entregado", [product.attendantEmail], emailBody);
  }

  static async cnd05(loadDocument: any){
    const subject = "Notificación CND-05";
    const donorName = loadDocument.reservedOrganizationName;
    const fundationName = loadDocument.bussisnesName;
    const product = loadDocument.productName;
    const emailBody: string = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notificación CND-05</title>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #FFFFFF;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #767676;
            color: #FFFFFF;
            padding: 10px 50px;
            border-radius: 5px;
            max-width: 600px;
            margin: 20px auto;
        }

        .logo {
            display: flex;
            align-items: center;
        }

        .logo img {
            margin-right: 15px;
            width: 180px;
            height: auto;
        }

        .notification-text {
            font-size: 25px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: right;
            font-family: "Comic Sans MS", cursive;
        }

        .content {
            max-width: 600px;
            margin: 20px auto;
            font-size: 14px;
            line-height: 1.6;
            color: #000000;
            font-family: "Comic Sans MS", cursive;
        }

        .footer {
            max-width: 600px;
            margin: 40px auto;
            text-align: center;
            background-color: #E3096A;
            color: #FFFFFF;
            padding: 30px 50px;
            border-radius: 5px;
        }

        .footer span {
            display: block;
            font-family: "Comic Sans MS", cursive;
            font-size: 18px;
        }

        .footer a {
            color: #FFFFFF;
            text-decoration: none;
        }
    </style>
</head>

<body>
    <div class="header">
        <div class="logo">
            <img src="https://storage-masivdrive.masivapp.com/16543/6b9388c0-587d-4f7d-a1c4-34341cb75fc6.png"
                alt="Logo">
        </div>
        <div class="notification-text">
            <p>NOTIFICACIÓN</p>
        </div>
    </div>

    <div class="content">
        <p>Hola, ${donorName}</p>

        <p>Nos complace informarte que la
            fundación ${fundationName} ha emitido el certificado de donación
            correspondiente a tu generosa contribución de ${product}.</p>

        <p>Para finalizar el proceso, revisa,
            valida y acepta tu certificado de donación. No olvides valorar el
            proceso.&nbsp;</p>

        <p>Haz clic aquí. </p>

        <p><a href="https://givesharingfood.azurewebsites.net/login">https://givesharingfood.azurewebsites.net/login</a>
        </p>

        <p>&nbsp;</p>

        <p>¡Muchas gracias por tu generosa
            contribución! </p>

        <p>¡Juntos podemos hacer una gran
            diferencia!</p>

        <p>¡Hasta pronto!</p>

        <p>&nbsp;</p>
    </div>
    <div class="footer">
        <span>¿Necesitas ayuda? Contáctanos</span>
        <span><a href="mailto:givesharingfood@gmail.com">givesharingfood@gmail.com</a></span>
    </div>
</body>

</html>`;
    await sendEmailNotification(subject, "Certificado de Donación", [loadDocument.email], emailBody);
  }
}
