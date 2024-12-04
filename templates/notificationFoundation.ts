import { sendEmailNotification } from "../src/helpers/emailNotification.Helper";

export class NotificationFoundation {
    static async cnf01(organization:any){
        const subject = "Notificación CNF-01";
        const fundationName = organization.bussisnesName;
        const emailBody: string = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notificación CNF-01</title>
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
      <p>Hola, ${fundationName}</p>

      <p>¡Felicitaciones! Tu registro en GiveSharingFood ha sido revisado y aprobado con éxito. Ahora puedes iniciar sesión en nuestro portal y comenzar a explorar opciones para recibir alimentos.</p>
      
      <p>Haz clic aquí.</p>
      
      <p><a href="https://givesharingfood.azurewebsites.net/login">https://givesharingfood.azurewebsites.net/login</a></p>
      
      <p>Gracias por unirte a nuestra comunidad y por tu compromiso con ayudar a quienes más lo necesitan.</p>
      
      <p>¡Juntos podemos hacer una gran diferencia!</p>
      
      <p>¡Hasta pronto!</p>
      
      <p>&nbsp;</p>
    </div>
    <div class="footer">
        <span>¿Necesitas ayuda? Contáctanos</span>
        <span><a href="mailto:givesharingfood@gmail.com">givesharingfood@gmail.com</a></span>
    </div>
</body>

</html>`;
    await sendEmailNotification(subject, "Activacion de organización",[organization.email], emailBody);
    }

    static async cnf02(product:any){
        const subject = "Notificación CNF-02";
        const donorName = product.attendantName;
        const fundationName = product.bussisnesName;
        const emailBody: string = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Notificación CNF-02</title>
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
    <p>Hola, ${fundationName} </p>

    <p>¡Tenemos algo para ti! ¡¡ALERTA DE DONACIÓN!! ${donorName} tiene un producto que te puede interesar.
      ¡Entra y resérvalo ya!</p>

    <p>Este producto está a la vuelta de la esquina y es justo lo que necesitas.</p>

    <p>Haz clic aquí .</p>

    <p><a href="https://givesharingfood.azurewebsites.net/login">https://givesharingfood.azurewebsites.net/login</a></p>

    <p>Gracias por unirte a nuestra comunidad y por tu compromiso con ayudar a quienes más lo necesitan. </p>

    <p>¡Juntos podemos hacer una gran diferencia!</p>

    <p>¡Hasta pronto!</p>

    <p>&nbsp;</p>
  </div>
  <div class="footer">
    <span>¿Necesitas ayuda? Contáctanos</span>
    <span><a href="mailto:givesharingfood@gmail.com">givesharingfood@gmail.com</a></span>
  </div>
</body>

</html>`;
    await sendEmailNotification(subject, "Alerta de producto",[product.email], emailBody);
    }

    static async cnf03(product: any){
        const subject = "Notificación CNF-03";
        const donorName = product.attendantName;
        const fundationName = product.bussisnesName;
        const emailBody: string = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notificación CNF-03</title>
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
        <p>Hola, ${fundationName} </p>

        <p>¡Felicitaciones! Su reserva del
            producto donado por ${donorName} ha sido confirmada con éxito. Recuerda
            ponerte en contacto con el donante para coordinar los detalles de la entrega.
            Puedes seguir el progreso en tu perfil.</p>

        <p>Haz clic aquí .</p>

        <p><a href="https://givesharingfood.azurewebsites.net/login">https://givesharingfood.azurewebsites.net/login</a>
        </p>

        <p>Gracias por unirte a nuestra
            comunidad y por tu compromiso con ayudar a quienes más lo necesitan.
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
    await sendEmailNotification(subject, "Producto Reservado", [product.email], emailBody);
    }

    static async cnf04(product: any){
        const subject = "Notificación CNF-04";
        const donorName = product.attendantName;
        const fundationName = product.bussisnesName;
        const emailBody: string = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notificación CNF-04</title>
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
        <p>Hola, ${fundationName} </p>

        <p>¡Felicitaciones! Te confirmamos que
            la entrega de la donación de ${donorName} se ha realizado con éxito. Ahora, no
            olvides emitir el certificado de donación, teniendo en cuenta los parámetros
            mínimos de legalidad.&nbsp;</p>

        <p>Haz clic aquí .</p>

        <p><a href="https://givesharingfood.azurewebsites.net/login">https://givesharingfood.azurewebsites.net/login</a>
        </p>

        <p>Gracias por unirte a nuestra
            comunidad y por tu compromiso con ayudar a quienes más lo necesitan.
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
    await sendEmailNotification(subject, "Producto Entregado", [product.email], emailBody);
    }

    static async cnf05(loadDocument: any){
        const subject = "Notificación CNF-05";
        const fundationName = loadDocument.bussisnesName;
        const emailBody: string = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notificación CNF-05</title>
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
        <p>Hola, ${fundationName} </p>

        <p>¡Confirmado! El certificado de
            donación ha sido cargado correctamente y el donante ya lo ha revisado y
            APROBADO. Ahora puedes valorar la donación y calificar el proceso a través de la
            plataforma.&nbsp;</p>

        <p>Haz clic aquí .</p>

        <p><a href="https://givesharingfood.azurewebsites.net/login">https://givesharingfood.azurewebsites.net/login</a>
        </p>

        <p>Gracias por unirte a nuestra
            comunidad y por tu compromiso con ayudar a quienes más lo necesitan.
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
    await sendEmailNotification(subject, "Producto Entregado", [loadDocument.email], emailBody);
    }
}
