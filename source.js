var mode = 0;
var apikey = "";
var devicename = "";
var wifiloop;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const p_digirom = urlParams.get('d');
console.log(p_digirom);

if(p_digirom){
    document.getElementById('input').value = p_digirom;
}

if ('serial' in navigator) {
    document.getElementById('connect_serial_button').style.width = "50%";
    document.getElementById('connect_wificom_button').style.width = "50%";
} else{
    document.getElementById('connect_serial_button').style.display = "none";
    document.getElementById('connect_wificom_button').style.width = "100%";
}

const log = document.getElementById("log")

document.addEventListener('click', (event) => {
    if (event.target == document.getElementById("wificom_box")) {
        document.getElementById("wificom_box").style.display = "none";
    }
});

function send() {
    const toSend = document.getElementById("input").value
    if (mode == 1) {
        writeToStream(toSend)
    } else if (mode == 2) {
        if (wifiloop) {
            clearTimeout(wifiloop);
            wifiloop = 0;
        }
        wificom_send(toSend)
    }
}

function handle(e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        send();
    }
}

function connect_wificom() {
    document.getElementById("wificom_box").style.display = "block";
    if (getCookie("apikey")) {
        apikey = getCookie("apikey");
        document.getElementById('apikey').value = apikey;
    }
    if (getCookie("devicename")) {
        devicename = getCookie("devicename");
        document.getElementById('devicename').value = devicename;
    }

}

async function connect_serial() {

    port = await navigator.serial.requestPort();
    if (port) {
        const inputField = document.getElementById("input");
        inputField.disabled = false;
        inputField.focus();
        inputField.select();
        document.getElementById("sendButton").disabled = false;
        document.getElementById("connect_serial_button").disabled = true;
        document.getElementById("connect_wificom_button").disabled = true;
        await port.open({ baudRate: 9600 });
        console.log('Open');
        mode = 1;
        let decoder = new TextDecoderStream();
        inputDone = port.readable.pipeTo(decoder.writable);
        inputStream = decoder.readable;

        const encoder = new TextEncoderStream();
        outputDone = encoder.readable.pipeTo(port.writable);
        outputStream = encoder.writable;

        reader = inputStream.getReader();
        readLoop();
    }
}

function writeToStream(line) {
    const writer = outputStream.getWriter();
    console.log('[SEND]', line);
    writer.write(line + '\r');
    writer.releaseLock();
}

async function readLoop() {
    console.log('Readloop');

    while (true) {
        const { value, done } = await reader.read();
        console.log('value', value);
        console.log('done', done);


        if (value) {
            log.textContent += value;
            log.scrollTop = log.scrollHeight;
        }
        if (done) {
            console.log('[readLoop] DONE', done);
            reader.releaseLock();
            break;
        }
    }
}

function readLoop_wifi() {
    const url = new URL(
        "https://wificom.dev/api/v2/application/last_output"
    );

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    let body = {
        "api_key": apikey,
        "device_name": devicename,
        "application_uuid": "1783798759430213"
    };

    fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    }).then(response => response.json()).then(function (data) {
        console.log(data);
        if (data['last_output']) {
            log.textContent += data['last_output'] + '\n';
            log.scrollTop = log.scrollHeight;
        }
        wifiloop = setTimeout(function () {
            readLoop_wifi();
        }, 5000);
        if (data['last_online_ago_seconds'] > 10) {
            log.textContent += 'Wificom is disconnected\n';
            log.scrollTop = log.scrollHeight;
            document.getElementById("sendButton").disabled = true;
            document.getElementById("input").disabled = true;
            document.getElementById("connect_serial_button").disabled = false;
            document.getElementById("connect_wificom_button").disabled = false;
            clearTimeout(wifiloop);
            wifiloop = 0;
        }

    });
}

function openTAP(evt, Name) {
    console.log(evt)
    console.log(Name)
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(Name).style.display = "block";
    document.getElementById(evt).className += " active";
}

var digiroms = [
    ["PENZ", "Battle NatureSpiritsZ", "V1-836E-212E-288E-182E-018E-@800E"],
    ["PENZ", "Battle DeepSaversZ", "V1-837E-279E-BCEE-14BE-00EE-@800E"],
    ["PENZ", "Battle NightmareSoldeirsZ", "V1-838E-2D9E-45BE-156E-00EE-@800E"],
    ["PENZ", "Battle WindGuardiansZ", "V1-839E-2D9E-45BE-156E-00EE-@800E"],
    ["PENZ", "Battle MetalEmpireZ", "V1-83AE-2D9E-45BE-156E-00EE-@800E"],
    ["PENZ", "Battle VirusBustersZ", "V1-83BE-2D9E-45BE-156E-00EE-@800E"],
    ["PENZ", "Jogress Vaccine Adult", "V2-04^0E-478E-@E00E"],
    ["PENZ", "Jogress Data Adult", "V2-04^0E-4E9E-@E00E"],
    ["PENZ", "Jogress Virus Adult", "V2-04^0E-4EEE-@E00E"],
    ["PENZ", "Jogress Free Adult", "V2-04^0E-57BE-@E00E"],
    ["PENZ", "Jogress Vaccine Perfect", "V2-04^0E-6A0E-@E00E"],
    ["PENZ", "Jogress Data Perfect", "V2-04^0E-63DE-@E00E"],
    ["PENZ", "Jogress Virus Perfect", "V2-04^0E-63AE-@E00E"],
    ["PENZ", "Jogress Free Perfect", "V2-04^0E-77BE-@E00E"],
    ["PENZ", "Jogress Angemon", "V2-2C6E-430E-@E00E"],
    ["PENZ", "Jogress Aquilamon", "V2-2C7E-49FE-@E00E"],
    ["PENZ", "Jogress Tailmon", "V2-2C8E-503E-@E00E"],
    ["PENZ", "Jogress XV-mon", "V2-2C9E-433E-@E00E"],
    ["PENZ", "Jogress Ankylomon", "V2-2CAE-494E-@E00E"],
    ["PENZ", "Jogress Stingmon", "V2-2CBE-4F8E-@E00E"],
    ["PENZ", "Jogress War Greymon", "V2-047E-984E-@E00E"],
    ["PENZ", "Jogress Metal Garurumon", "V2-049E-985E-@E00E"],
    ["PENZ", "Jogress Kaiser Greymon", "V2-047E-98BE-@E00E"],
    ["PENZ", "Jogress Magna Garurumon", "V2-049E-98BE-@E00E"],
    ["PENZ", "Jogress Omegamon", "V2-04^0E-B44E-@E00E"],
    ["PENZ", "Jogress Imperialdramon", "V2-048E-963E-@E00E"],
    ["DMX", "Battle DMX1 Black", "V1-800E-218E-483E-142E-010E-@800E"],
    ["DMX", "Battle DMX1 White", "V1-801E-20DE-943E-143E-010E-@800E"],
    ["DMX", "Battle DMX2 Red", "V1-802E-20AE-003E-143E-016E-@800E"],
    ["DMX", "Battle DMX2 Purple", "V1-803E-21EE-025E-14FE-016E-@800E"],
    ["DMX", "Battle DMX3 Yellow", "V1-804E-218E-952E-143E-014E-@800E"],
    ["DMX", "Battle DMX3 Blue", "V1-805E-225E-592E-143E-014E-@800E"],
    ["DMX", "Jogress GankoomonX", "V1-804E-AF5E-122E-28AE-0D0E-@800E"],
    ["DMX", "Jogress JesmonX", "V1-805E-B19E-324E-287E-0BEE-@800E"],
    ["DMC", "Ver.1 Unlock Grasslands Background", "C1-47444C4300000000000B007300019406-47444C4300020002000000000000938B"],
    ["DMC", "Ver.2 Unlock Desert Background", "C1-47444C4300000001000C007300019408-47444C4300020002000000000000938B"],
    ["DMC", "Ver.3 Unlock Forest Background", "C1-47444C4300000002000B007300019408-47444C4300020002000000000000938B"],
    ["DMC", "Ver.4 Unlock Mountains Background", "C1-47444C4300000003000B007300019409-47444C4300020002000000000000938B"],
    ["DMC", "Ver.5 Unlock Beach Background", "C1-47444C4300000004000B00730001940A-47444C4300020002000000000000938B"],
    ["DMC", "Ver.1 Jogress Cres Garurumon into Omegamon Alter-S", "C1-47444C4300000000000E00AA00019440-47444C430002003000000000000093B9"],
    ["DMC", "Ver.2 Jogress Blitz Greymon into Omegamon Alter-S", "C1-47444C4300000001000F00730001940B-47444C4300020002000000000000938B"],
    ["DMC", "Ver.3 Jogress Mugendramon into Millenniumon", "C1-47444C4300000002000E00730002940C-47444C4300020011000000000000939A"],
    ["DMC", "Ver.3 Jogress Darkdramon into Chaosmon", "C1-47444C4300000002001100B400039451-47444C4300020006000000000000938F"],
    ["DMC", "Ver.4 Jogress Bancho Leomon into Chaosmon; Mugendramon into Chaosdramon", "C1-47444C4300000003000E00AA00019443-47444C430002006900000000000093F2"],
    ["DMC", "Ver.5 Jogress Chimairamon into Millenniumon; Darkdramon into Chaosdramon", "C1-47444C4300000004000E00AA00019444-47444C430002001E00000000000093A7"],
    ["PenC", "Unlock Lakeside Background", "C1-47444470001000000002001400038BDD-47444470001200390000000000028C01"],
    ["PenC", "Unlock Underwater Background", "C1-47444470001000010002001400038BDE-47444470001200390000000000028C01"],
    ["PenC", "Unlock Castle Background", "C1-47444470001000020002001400038BDF-47444470001200390000000000028C01"],
    ["PenC", "Unlock Flower Field Background", "C1-47444470001000030002001400038BE0-47444470001200390000000000028C01"],
    ["PenC", "Unlock Factories Background", "C1-47444470001000040002001400038BE1-47444470001200390000000000028C01"],
    ["PenC", "Unlock Sky Background", "C1-47444470001000050002001400038BE2-47444470001200390000000000028C01"],
    ["PenC", "Unlock Grasslands Background", "C1-47444C4300000000000B007300019406-47444C4300020002000000000000938B"],
    ["PenC", "DMC1 Unlock Grasslands Background", "C1-47444C4300000000000B007300019406-47444C4300020002000000000000938B"],
    ["PenC", "DMC1 Unlock Grasslands Background", "C1-47444C4300000000000B007300019406-47444C4300020002000000000000938B"],
    ["PenC", "DMC2 Unlock Desert Background", "C1-47444C4300000001000C007300019408-47444C4300020002000000000000938B"],
    ["PenC", "DMC3 Unlock Forest Background", "C1-47444C4300000002000B007300019408-47444C4300020002000000000000938B"],
    ["PenC", "DMC4 Unlock Mountains Background", "C1-47444C4300000003000B007300019409-47444C4300020002000000000000938B"],
    ["PenC", "DMC5 Unlock Beach Background", "C1-47444C4300000004000B00730001940A-47444C4300020002000000000000938B"],
    ["PenC", "Jogress with Vaccine Stage IV", "C1-47444470001400050006000300038BD9"],
    ["PenC", "Jogress with Data Stage IV", "C1-47444470001400020008000200038BD7"],
    ["PenC", "Jogress with Virus Stage IV", "C1-47444470001400040009000100038BD9"],
    ["PenC", "Jogress with Vaccine Stage V", "C1-4744447000140001000D000300048BDD"],
    ["PenC", "Jogress with Data Stage V", "C1-4744447000140003000F000200048BE0"],
    ["PenC", "Jogress with Virus Stage V", "C1-47444470001400000011000100048BDE"],
    ["PenC", "Jogress Lady Devimon into Mastemon", "C1-47444470001400000012000300048BE1"],
    ["PenC", "Jogress El Doradimon or Metal Etemeon into Tlalocmon", "C1-47444470001400000014000200058BE3"],
    ["PenC", "Jogress Saber Leomon or Metal Etemeon into Tlalocmon", "C1-47444470001400000018000200058BE7"],
    ["PenC", "(UNTESTED) Jogress Hououmon into Mitamamon", "C1-47444470001400010013000300058BE4"],
    ["PenC", "Jogress Plesiomon into Aegisdramon", "C1-47444470001400010014000200058BE4"],
    ["PenC", "Jogress Metal Seadramon into Aegisdramon", "C1-47444470001400010016000200058BE6"],
    ["PenC", "Jogress Piemon into Voltobautamon", "C1-47444470001400020010000100048BDF"],
    ["PenC", "Jogress Angewomon into Mastemon", "C1-47444470001400020012000100048BE1"],
    ["PenC", "(UNTESTED) Jogress Vamdemon into Voltobautamon", "C1-47444470001400020016000100058BE6"],
    ["PenC", "Jogress Marin Angemon into Mitamamon", "C1-47444470001400030013000300058BE6"],
    ["DM20", "Get Copy BlitzGreymon", "V1-0C02-1207-810E-03AE-000E-000E-000E-000E-000E-@000E"],
    ["DM20", "Get Copy CresGarurumon", "V1-1203-0107-811E-07DE-000E-000E-000E-000E-000E-@000E"],
    ["DM20", "Get Copy Aegisdramon", "V1-0501-0907-812E-0F8E-000E-000E-000E-000E-000E-@000E"],
    ["DM20", "Get Copy Mugendramon", "V1-150D-0507-813E-13AE-000E-000E-000E-000E-000E-@000E"],
    ["DM20", "Get Copy Slayerdramon", "V1-0C13-1901-814E-17CE-000E-000E-000E-000E-000E-@000E"],
    ["DM20", "Get Copy Breakdramon", "V1-1202-0105-814E-18AE-000E-000E-000E-000E-000E-@000E"],
    ["DM20", "Get Copy Apollomon", "V1-1001-0C0F-812E-1A0E-000E-000E-000E-000E-000E-@000E"],
    ["DM20", "Get Copy Dianamon", "V1-0904-0E01-813E-1B1E-000E-000E-000E-000E-000E-@000E"],
    ["DM20", "Get Copy WarGreymon", "V1-0117-1207-810E-1C0E-000E-000E-000E-000E-000E-@000E"],
    ["DM20", "Get Copy MetalGarurumon", "V1-050D-0107-811E-1D1E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Vaccine Adult ", "V1-0101-0101-816E-078E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Data Adult ", "V1-0101-0101-816E-0DDE-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Virus Adult ", "V1-0101-0101-816E-242E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Vaccine Perfect ", "V1-0101-0101-816E-1BCE-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Data Perfect ", "V1-0101-0101-816E-155E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Virus Perfect ", "V1-0101-0101-816E-04AE-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy WarGreymon", "V1-0101-0101-816E-1C0E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy MetalGarurumon", "V1-0101-0101-816E-1C5E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Demon", "V1-0101-0101-816E-112E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Belphemon", "V1-0101-0101-816E-22AE-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Vamdemon", "V1-0101-0101-816E-0FEE-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Piemon", "V1-0101-0101-816E-116E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Durandamon", "V1-0101-0101-816E-28CE-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Bryweludramon", "V1-0101-0101-816E-311E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Ouryumon", "V1-0101-0101-816E-358E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Alphamon", "V1-0101-0101-816E-388E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Rosemon", "V1-0101-0101-816E-171E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Lotusmon", "V1-0101-0101-816E-36DE-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Angewomon", "V1-0101-0101-816E-04CE-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Lady Devimon", "V1-0101-0101-816E-106E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Bancho Leomon", "V1-0101-0101-816E-298E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Darkdramon", "V1-0101-0101-816E-2CAE-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Slayerdramon", "V1-0101-0101-816E-2C0E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Breakdramon", "V1-0101-0101-816E-2C6E-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Omegamon", "V1-0101-0101-816E-38CE-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Get Copy Imperialdramon", "V1-0101-0101-816E-39FE-000E-000E-000E-000E-000E-@000E"],
    ["Pen20", "Battle Evolve Jesmon", "V1-006E-388E-000E-000E-000E-000E-000E-000E-000E-@CF0E"],
    ["Pen20", "Battle LalaDigitama DK/BZ", "V1-006E-2D4E-000E-000E-000E-000E-000E-000E-000E-@CF0E"],
    ["Pen20", "Battle LalaDigitama SBK/SBU", "V1-008E-2A8E-000E-000E-000E-000E-000E-000E-000E-@CF0E"],
    ["PenOG", "Battle toy win", "V1-503F-000F-080F-@BDFF"],
    ["PenOG", "Battle toy lost", "V1-503F-01FF-09FF-@BDFF"],
    ["PenOG", "Jogress Vaccine Adult 1", "V2-146F-@D^0^0F"],
    ["PenOG", "Jogress Vaccine Adult 2", "V2-547F-@D^0^0F"],
    ["PenOG", "Jogress Data Adult 1", "V2-448F-@D^0^0F"],
    ["PenOG", "Jogress Data Adult 2", "V2-249F-@D^0^0F"],
    ["PenOG", "Jogress VirusAdult 1", "V2-04AF-@D^0^0F"],
    ["PenOG", "Jogress VirusAdult 2", "V2-34BF-@D^0^0F"],
    ["PenOG", "Jogress Zudomon", "V2-14CF-@D^0^0F"],
    ["PenOG", "Jogress Vaccine Perfect 2", "V2-34DF-@D^0^0F"],
    ["PenOG", "Jogress Data Perfect 1", "V2-24EF-@D^0^0F"],
    ["PenOG", "Jogress Data Perfect 2", "V2-44FF-@D^0^0F"],
    ["PenOG", "Jogress VirusPerfect 1 Ver.0", "V2-050F-@D^0^0F"],
    ["PenOG", "Jogress VirusPerfect 1", "V2-550F-@D^0^0F"],
    ["PenOG", "Jogress VirusPerfect 2 Ver.0", "V2-051F-@D^0^0F"],
    ["PenOG", "Jogress VirusPerfect 2", "V2-551F-@D^0^0F"],
    ["PenOG", "Jogress With WarGreymon", "V2-552F-@D^0^0F"],
    ["PenOG", "Jogress With MetalGarurumon", "V2-553F-@D^0^0F"],
    ["PenCycle", "Jogress With Garurumon Vaccine", "V2-6231-7070"],
    ["PenCycle", "Jogress With Meramon Data", "V2-9261-9081 "],
    ["PenCycle", "Jogress With Devimon Virus", "V2-7241-C0A2"],
    ["Progress", "toy wins (against Terriermon)", "V1-9841-2201-8001-3A01-2001"],
    ["Progress", "toy wins against WarGreymon: to evolve MetalGarurumon X -> Omegamon", "V1-8921-AFB1-8001-3A01-4001"],
    ["Progress", "toy loses (against Omegamon)", "V1-A971-6FF1-8001-3BF1-D001"],
    ["Progress", "Jogress XV-Mon -> Megadramon, Tyranomon -> Paildramon, Angemon -> Angewomon, Dobermon -> Mihiramon", "V2-81A1-EA51"],
    ["Progress", "Jogress Tyranomon -> Paildramon, XV-Mon -> Megadramon, Witchmon -> Andiramon, Aquilamon -> Cerberumon X", "V2-81B1-1A11"],
    ["Progress", "Jogress Stingmon (D-Scanner) XV-Mon -> Paildramon", "V2-01A1-AA1F"],
    ["Progress", "Jogress Airdramon (D-Scanner) Tyrannomon -> Megadramon", "V2-01B1-5A5F"],
    ["Progress", "Jogress Angemon (D-Scanner) Witchmon -> Angewomon", "V2-91A1-1A11"],
    ["Progress", "Jogress Tailmon (D-Scanner) Angemon -> Andiramon", "V2-11B1-4A5F"],
    ["Progress", "Jogress Paildramon (D-Scanner) MetalGreymon -> Imperialdramon", "V2-0211-AB8F"],
    ["Progress", "Jogress Megadramon (D-Scanner) MegaloGrowmon -> Megidramon", "V2-0251-FBFF"],
    ["Progress", "Jogress Angewoman (D-Scanner) Bastemon -> Cherubimon", "V2-1251-EBFF"],
    ["Progress", "Jogress Angewoman (D-Scanner) HolyAngemon -> Seraphimon", "V2-1211-9B8F"],
    ["Progress", "Jogress MetalGreymon -> Megidramon, MegaloGrowmon -> Imperialdramon, Bastemon -> Seraphimon, WereGarurumon -> Qinglongmon", "V2-8211-BBF1"],
    ["Progress", "Jogress MegaloGrowmon -> Imperialdramon, MetalGreymon -> Megidramon, HolyAngemon -> Cherubimon, GrappLeomon -> Baihumon", "V2-8251-EB81"],
    ["PenX", "real toy wins (against Kuwagamon X)", "X1-0159-4379-0009-C009"],
    ["PenX", "real toy loses (against Kuwagamon X)", "X1-0159-4379-0009-C1F9"],
    ["PenX", "real toy wins (against Okuwamon X; good for Justice/Evil/Nature Accel for X points)", "X1-0249-E589-0009-F009"],
    ["PenX", "trade meat-M", "X2-0429-A009"],
    ["PenX", "trade meat-L", "X2-0439-9009"],
    ["PenX", "trade protein+", "X2-0449-8009"],
    ["PenX", "trade str-max", "X2-0459-7009"],
    ["PenX", "trade aqua orb", "X2-0469-6009"],
    ["PenX", "trade metal rise", "X2-0479-5009"],
    ["PenX", "trade sky wing", "X2-0489-4009"],
    ["PenX", "trade zombie meat", "X2-0499-3009"],
    ["PenX", "trade forest leaf", "X2-04A9-2009"],
    ["PenX", "trade d-poison", "X2-04B9-1009"],
    ["PenX", "trade cho-energy", "X2-04C9-0009"],
    ["PenX", "trade master tag", "X2-04D9-F009"],
    ["PenX", "trade evo-5", "X2-04E9-E009"],
    ["PenX", "trade level reverse", "X2-04F9-D009"],
    ["PenX", "1.X Jogress Dorugamon -> Dorugremon", "V2-0D29-8189"],
    ["PenX", "1.X Jogress Greymon X -> Dorugremon", "V2-0C99-2189"],
    ["PenX", "1.X Jogress Raptordramon (1.0) / Death-X Dorugamon (1.5) -> MegaSeadramon X", "V2-0CF9-3209"],
    ["PenX", "1.X Jogress Seadramon X -> MegaSeadramon X", "V2-0CC9-6209"],
    ["PenX", "1.X Jogress Ookuwamon X -> Dorugoramon", "V2-0D89-2279"],
    ["PenX", "1.X Jogress Dorugremon -> Dorugoramon", "V2-0E49-5279"],
    ["PenX", "1.X Jogress Grademon (1.0) / Death-X DoruGreymon (1.5) -> Alphamon (1.0) Death-X Dorugoramon (1.5)", "V2-0DE9-92A9"],
    ["PenX", "1.X Jogress Ookuwamon X -> GrandisKuwagamon", "V2-1E49-7339"],
    ["PenX", "1.X Jogress Alphamon (1.0) / Death X-Dorugoramon (1.5) -> Omegamon X", "V2-1EA9-D379"],
    ["PenX", "2.0 Jogress Growmon X -> Hisharyumon", "V2-1C99-F1A9"],
    ["PenX", "2.0 Jogress Ginryumon -> Hisharyumon", "V2-1D29-51A9"],
    ["PenX", "2.0 Jogress Hisharyumon -> Ouryumon", "V2-1E49-7339"],
    ["PenX", "2.0 Jogress SkullBaluchimon -> DinoTigemon", "V2-1DE9-62C9"],
    ["PenX", "2.0 Jogress MameTyramon -> DinoTigemon", "V2-1DB9-92C9"],
    ["PenX", "2.0 Jogress Triceramon X (2nd or 3rd Gen) -> UltimateBrachimon", "V2-0E49-8339"],
    ["PenX", "2.0 Jogress DinoTigemon -> Dukemon X", "V2-0EA9-E379"],
    ["PenX", "3.0 Jogress Raptordramon -> Grademon", "X2-2D29-41A9"],
    ["PenX", "3.0 Jogress Waspmon -> Grademon", "X2-2CC9-B1A9"],
    ["PenX", "3.0 Jogress Ginryumon ->Hisharyumon", "X2-2D59-E1D9"],
    ["PenX", "3.0 Jogress Omekamon -> Hisharyumon", "X2-2CF9-51D9"],
    ["PenX", "3.0 Jogress Cannonbeemon -> TigerVespimon", "V2-2DB9-82C9"],
    ["PenX", "3.0 Jogress Hisharyumon -> TigerVespimon", "V2-2DE9-72A9"],
    ["PenX", "3.0 Jogress Alphamon -> TigerVespimon", "V2-1E49-7339"],
    ["PenX", "3.0 Jogress Alphamon -> Alphamon: Ouryuken (need to feed 3+ Master tag and 1+ XX to Alphamon first)", "X2-2E79-6309"],
    ["PenX", "3.0 Jogress Ouryumon -> Alphamon: Ouryuken (need to feed 3+ Master tag and 1+ XX to Ouryumon first)", "X2-2E49-9309"],
    ["PenX", "Omegamon X Battle (0 shakes, XAI 3, v1.5)", "X2-0369-7F09-8009-@4^1^F9"],
    ["PenX", "Dukemon X Battle (0 shakes, XAI 3, v2.0)", "X2-1369-CF09-0009-@4^1^F9"],
    ["PenX", "Ouryumon X Battle (0 shakes, XAI 1, No Blast Evo, v3.0)", "X2-2299-9C49-8009-D059"],
    ["Accel", "Jogress BanchoLeomon/Darkdramon/Sleipmon -> Chaosdramon", "X2-2D8A-A1EA"],
    ["Accel", "Jogress Valdurmon -> Chaosdramon", "X2-3D8A-A1DA"],
    ["DMmini", "battle for egg on Ultimate Accel and for items on iC", "X1-0099-1869-7AF9-@4009"],
    ["D2", "Unlock Veedramon/Meicoomon (depends on version)/SkipAdult (Champion) battle requirement", "V2-FC03-1DE2-EE11"],
    ["D2", "Unlock Crest of Courage (use battle)", "V1-FF00-FA05-03FC-FF00"],
    ["D3", "15th Skip Adult (Champion) battle requirement", "V2-FC03-1DE2-EE11"],
    ["D3", "Unlock Imperialdramon Paladin Mode & Secret Cutscenes", "V2-FF00-FF00-03FC-FF00"],
    ["D3", "(JP) battle real toy wins (useful on 15th too)", "V1-800F-000F-080F-000F"],
    ["D3", "Digimental courage", "V2-8C0F-480F"],
    ["D3", "Digimental friendship", "V2-8C1F-380F"],
    ["D3", "Digimental miracles", "V2-8C2F-280F"],
    ["D3", "Digimental love", "V2-8C3F-180F"],
    ["D3", "Digimental purity-sincerity", "V2-8C4F-080F"],
    ["D3", "Digimental knowledge", "V2-8C5F-F80F"],
    ["D3", "Digimental sincerity-reliability", "V2-8C6F-E80F"],
    ["D3", "Digimental light", "V2-8C7F-D80F"],
    ["D3", "Digimental hope", "V2-8C8F-C80F"],
    ["D3", "Digimental kindness", "V2-8C9F-B80F"],
    ["D3", "Jogress Stingmon -> Dinobeemon, XV-Mon -> Paildramon", "V2-841F-B80F"],
    ["D3", "Jogress XV-Mon -> Paildramon, Stingmon -> Dinobeemon", "V2-840F-C80F"],
    ["D-Scanner", "toy wins", "V1-0811-32C1-8001-3A01-@5001"],
    ["D-Scanner", "toy loss and erases Digimon", "V1-0C61-4E41-BFF1-1FF1-@5001"],
    ["D-Scanner", "Scan Gabumon on D-Scanner v1", "BC1-0000000000111"],
    ["D-Scanner", "Scan Renamon on D-Scanner v2", "BC1-0000000020211"],
    ["D-Scanner", "Scan Bearmon on D-Scanner v3", "BC1-0000000750311"],
    ["D-Scanner", "1.0 Jogress Stingmon -> Paildramon", "V1-81A1-2A11"],
    ["D-Scanner", "1.0 Jogress Paildramon->Imperialdramon DM", "V1-8211-2B81"],
    ["D-Scanner", "1.0 Jogress Airdramon->Megadramon", "V1-81B1"],
    ["D-Scanner", "1.0 Jogress Megadramon->Megidramon", "V1-8251-7BF1"],
    ["D-Scanner", "2.0 Jogress Angemon->Angewoman", "V1-91A1"],
    ["D-Scanner", "2.0 Jogress Angewoman->Seraphimon", "V1-9211"],
    ["D-Scanner", "2.0 Jogress Tailmon-Andiramon", "V1-91B1"],
    ["D-Scanner", "2.0 Jogress Andiramon->Cherubimon", "V1-9251"],
    ["D-Scanner", "3.0 Jogress Darcmon->Silphymon", "V1-91A1"],
    ["D-Scanner", "3.0 Jogress Silphymon-SlashAngemon", "V1-8211-2B8F"],
    ["D-Scanner", "3.0 Jogress Thundernbirdmon->Hippogriffmon", "V1-91B1"],
    ["D-Scanner", "3.0 Jogress Lucemon FM->Huanlongmon", "V1-9211"],
    ["iC", "IR 10x Battle", "!IC2-0067-4257-0197-0007-D087"],
    ["iC", "IR 20x Battle", "!IC2-1137-4B07-0B37-0007-E1F7"],
    ["iC", "IR Burst Battle", "!IC2-2067-6047-0247-0007-5037"],
    ["iC", "IR DigiWindow (Battle)", "!IC2-1577-4927-0B47-0007-0057"],
    ["iC", "IR DigiWindow (Scan)", "!IC2-1577-4927-0B47-0007-3117"],
    ["iC", "IR Battle with iC 10x for Digi Shop 1", "IC1-C067-4257-0197-0007-@F007"],
    ["iC", "IR Battle with iC 20x for Digi Shop 2", "IC1-D067-4257-0197-0007-@F007"],
    ["iC", "IR Battle with Burst for Digi Shop 3", "IC1-E067-4257-0197-0007-@F007"],
    ["iC", "IR Battle with DigiWindow for Digi Shop 4", "IC1-D577-4927-0B47-0007-@F007"],
    ["iC", "Prong Battle", "X1-0099-1869-7AF9-@4009"],
    ["DataLink", "2000 points", "DL2-1301002000AA>>+?-1301002000AA>>+?"],
    ["DataLink", "Health Bar (food)", "DL2-120100030FAA>>+?-120100030FAA>>+?"],
    ["DataLink", "D-Charger (item)", "DL2-1201000034AA>>+?-1201000034AA>>+?"],
    ["DataLink", "Dragon DNA", "DL2-1201000200AA>>+?-1201000200AA>>+?"],
    ["DataLink", "Beast DNA", "DL2-1201000201AA>>+?-1201000201AA>>+?"],
    ["DataLink", "Insect DNA", "DL2-1201000202AA>>+?-1201000202AA>>+?"],
    ["DMOG", "Battle toy win", "V1-FC03-FD02"],
    ["DMOG", "Battle toy lost", "V1-B34C-FE01"],
]
var divicenlist = [];

digiroms.forEach(function (digirom) {
    if (!divicenlist.includes(digirom[0])) {
        divicenlist.push(digirom[0]);
        var _div = document.createElement("div");
        _div.className = "tabcontent"
        _div.id = digirom[0]
        document.getElementById("tabcontent").appendChild(_div);
        var _ul = document.createElement('ul');
        _ul.setAttribute('id', 'ul' + digirom[0]);
        document.getElementById(digirom[0]).appendChild(_ul);
    }

    var _li = document.createElement("li");
    _li.setAttribute('class', 'item');
    _li.innerHTML = digirom[1]
    _li.addEventListener('click', () => {
        rundigirom(digirom[2])
    })
    document.getElementById('ul' + digirom[0]).appendChild(_li);
})
console.log(divicenlist)

divicenlist.forEach(function (name) {
    var _button = document.createElement("button");
    _button.innerHTML = name;
    _button.className = 'tablinks'
    _button.id = 'bt_' + name
    _button.addEventListener('click', () => {
        openTAP('bt_' + name, name)
    })
    document.getElementById("tab").appendChild(_button);

});

function rundigirom(digirom) {
    console.log(digirom)
    document.getElementById("popup").innerHTML = digirom;
    document.getElementById("popup").style.display = "block";
    setTimeout(function () {
        document.getElementById("popup").style.display = 'none';
    }, 3000);
    document.getElementById("input").value = digirom;
    send();

}

function wificom_c() {
    apikey = document.getElementById("apikey").value
    devicename = document.getElementById("devicename").value
    if (apikey && devicename) {
        document.getElementById("wificom_box").style.display = "none";
        if (document.getElementById('savecookie').checked) {
            setCookie("apikey", apikey, 365);
            setCookie("devicename", devicename, 365);
        } else {
            setCookie("apikey", "", 0);
            setCookie("devicename", "", 0);
        }
        wificom_send("connect")
        mode = 2;
    }
}

function wificom_send(digirom) {
    var last_send;
    const url = new URL(
        "https://wificom.dev/api/v2/application/send_digirom"
    );

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    let body = {
        "api_key": apikey,
        "device_name": devicename,
        "application_uuid": "1783798759430213",
        "comment": "bhz",
        "digirom": digirom
    };

    fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    }).then(response => response.json()).then(function (data) {
        console.log(data);
        if (data['error']) {
            log.textContent += 'ERROR: ' + data['error'] + '\n';
            log.scrollTop = log.scrollHeight;
        }
        console.log(data['device']['device_name']);
        last_send = data['device']['last_code_sent_at']
        const url = new URL(
            "https://wificom.dev/api/v2/application/last_output"
        );

        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        };

        let body = {
            "api_key": apikey,
            "device_name": devicename,
            "application_uuid": "1783798759430213"
        };

        fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        }).then(response => response.json()).then(function (data2) {
            console.log(data2);
            if (last_send == data2['last_code_sent_at'] && data2['last_online_ago_seconds'] < 6) {
                if (digirom == "connect") {
                    log.textContent += "Send Digirom via wificom Successful\n";
                    log.scrollTop = log.scrollHeight;
                }
                mode = 2;
                const inputField = document.getElementById("input");
                inputField.disabled = false;
                inputField.focus();
                inputField.select();
                document.getElementById("sendButton").disabled = false;
                document.getElementById("connect_serial_button").disabled = true;
                document.getElementById("connect_wificom_button").disabled = true;
                readLoop_wifi();
            }
            if (data2['last_online_ago_seconds'] > 6) {
                document.getElementById("input").disabled = true;
                log.textContent += "Wificom is disconnected on " + data2['last_online_ago_seconds'] + " sec ago\n";
                log.scrollTop = log.scrollHeight;
            }
        });
    });
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
