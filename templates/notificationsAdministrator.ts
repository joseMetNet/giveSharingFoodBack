import { sendEmailNotification } from "../src/helpers/emailNotification.Helper";

export class NotificationAdministrator {
  static async cna01(organization: any) {
    const subject = "Notificación CNA-01";
    const donorName = organization.representativaName || "Donante";
    const email = organization.email || "Email";
    const date = organization.createdDate;
    const emailBody: string = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notificación CNA-02</title>
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
            <img src="https://storage-masivdrive.masivapp.com/16543/6b9388c0-587d-4f7d-a1c4-34341cb75fc6.png" alt="Logo">
        </div>
        <div class="notification-text">
            <p>NOTIFICACIÓN</p>
        </div>
    </div>

    <div class="content">
        <p>Hola, ADMIN</p>

        <p>Le informamos que se ha registrado un nuevo usuario en
                nuestra plataforma:</p>

        <p>Nombre de usuario: ${donorName}</p>

        <p>Correo electrónico: ${email}</p>

        <p>Fecha de registro: <span id="current-date">${date}</span></p>

        <p>ESTE USUARIO SE ENCUENTRA ACTUALMENTE PENDIENTE DE
                REVISIÓN Y REQUIERE SU AUTORIZACIÓN PARA SER HABILITADO, INACTIVADO O BLOQUEADO.</p>

        <p>Le solicitamos que revise la información del usuario y
                tome la decisión correspondiente lo antes posible.</p>
    </div>

    <div class="footer">
        <span>¿Necesitas ayuda? Contáctanos
        <span><a href="mailto:givesharingfood@gmail.com">givesharingfood@gmail.com</a>
    </div>
    <script>
    const currentDate = new Date();

    const formattedDate = currentDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    document.getElementById('current-date').textContent = formattedDate;
</script>
</body>

</html>
`;
    await sendEmailNotification(
      subject,
      "Nueva Organización",
      ['danimetnet@gmail.com'],
      emailBody
    );
  }

  static async cna02(product: any) {
    const subject = "Notificación CNA-02";
    const donorName = product.attendantName || "Donante";
    const products = product.productName || "Producto";
    const quantity = product.quantity || "Cantidad";
    const date = product.expirationDate;
    const emailBody: string = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notificación CNA-02</title>
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
            <img src="https://storage-masivdrive.masivapp.com/16543/6b9388c0-587d-4f7d-a1c4-34341cb75fc6.png" alt="Logo">
        </div>
        <div class="notification-text">
            <p>NOTIFICACIÓN</p>
        </div>
    </div>

    <div class="content">
        <p>Hola, ADMIN</p>
        <p>Le informamos que un nuevo donante ha realizado una oferta de donación de un producto.</p>
        <p>Detalles de la donación:</p>
        <ul>
            <li>Donante: ${donorName}</li>
            <li>Producto: ${products}</li>
            <li>Cantidad: ${quantity}</li>
            <li>Fecha de la oferta: ${date}</li>
        </ul>
        <p>Le solicitamos que, por favor, le dé el <strong>SEGUIMIENTO CORRESPONDIENTE</strong> a esta oferta y se
            comunique con el donante para coordinar los siguientes pasos, como la verificación del estado del producto,
            la logística de la entrega y la documentación necesaria.</p>
    </div>

    <div class="footer">
        <span>¿Necesitas ayuda? Contáctanos</span>
        <span><a href="mailto:givesharingfood@gmail.com">givesharingfood@gmail.com</a></span>
    </div>
</body>

</html>
`;
    await sendEmailNotification(
      subject,
      "Nuevo Producto",
      ['danimetnet@gmail.com'],
      emailBody
    );
  }

  static async cna03(product: any) {
    const subject = "Notificación CNA-03";
    const donorName = product.attendantName || "Donante";
    const fundName = product.bussisnesName;
    const date = product.date;
    const emailBody: string = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notificación CNA-03</title>
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
        <p>Hola, ADMIN</p>

        <p>Le informamos que la Fundación
            ${fundName} ha reservado el producto donado por ${donorName}.</p>

        <p>Por favor, tenga en cuenta esta
            reserva para dar seguimiento al proceso de donación. </p>

        <p>Puede encontrar más detalles sobre
            esta reserva en&nbsp;</p>

        <p><a href="https://givesharingfood.azurewebsites.net/login">https://givesharingfood.azurewebsites.net/login</a>
        </p>

        <p>Se estima que la entrega se realizará
            el ${date}</p>

        <p>&nbsp;</p>
    </div>

    <div class="footer">
        <span>¿Necesitas ayuda? Contáctanos</span>
        <span><a href="mailto:givesharingfood@gmail.com">givesharingfood@gmail.com</a></span>
    </div>
</body>

</html>`;
    await sendEmailNotification(
      subject,
      "Reserva de Producto",
      ['danimetnet@gmail.com'],
      emailBody
    )
  }

  static async cna04(product: any) {
    const subject = "Notificación CNA-04";
    const donorName = product.attendantName || "Donante";
    const fundName = product.bussisnesName;
    const emailBody: string = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notificación CNA-04</title>
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
        <p>Hola, ADMIN</p>

        <p>Le informamos que el donante ${donorName} ha ACEPTADO el certificado
             emitido por la fundacion ${fundName}.</p>

        <p>Por favor, tenga en cuenta esta aceptación para dar finalizado el proceso de donación. </p>

        <p>Puede encontrar más detalles sobre esta reserva en:</p>

        <p><a href="https://givesharingfood.azurewebsites.net/login">https://givesharingfood.azurewebsites.net/login</a>
        </p>


        <p>&nbsp;</p>
    </div>

    <div class="footer">
        <span>¿Necesitas ayuda? Contáctanos</span>
        <span><a href="mailto:givesharingfood@gmail.com">givesharingfood@gmail.com</a></span>
    </div>
</body>

</html>`;
    await sendEmailNotification(
      subject,"Aceptación de Certificado",
      ['danimetnet@gmail.com'],
      emailBody
    )
  }

  static async cna05(product: any) {
    const subject = "Notificación CNA-05";
    const donorName = product.attendantName || "Donante";
    const fundName = product.bussisnesName;
    const emailBody: string = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notificación CNA-05</title>
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
        <p>Hola, ADMIN</p>

        <p>Le informamos que el donante ${donorName} ha RECHAZADO el certificado emitido por la fundación ${fundName}.</p>

        <p>Por favor,
            <b> REALICE SEGUIMIENTO DE ESTE RECHAZO</b> y pongase en contacto con las partes.</p>

        <p>Puede encontrar más detalles sobre
            esta reserva en&nbsp;</p>

        <p><a href="https://givesharingfood.azurewebsites.net/login">https://givesharingfood.azurewebsites.net/login</a>
        </p>

        <p>Se estima que la entrega se realizará
            el [fecha]</p>

        <p>&nbsp;</p>
    </div>

    <div class="footer">
        <span>¿Necesitas ayuda? Contáctanos</span>
        <span><a href="mailto:givesharingfood@gmail.com">givesharingfood@gmail.com</a></span>
    </div>
</body>

</html>`;
    await sendEmailNotification(
        subject,"Rechazo de Certificado",['danimetnet@gmail.com'],
        emailBody
    )
  }
}
