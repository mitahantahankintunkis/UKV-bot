import { nanoid } from 'nanoid';


function projectNameToId(projectName='') {
    const cleanName = projectName.replace(/[^a-z0-9äöå]/gi, '_');
    const projectId = encodeURIComponent(cleanName);

    return projectId;
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return JSON.parse(userStr);
}


function testData() {
    const nodes = [
        /* 0*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Beep-boop, olen UKV-botti 🤖. Minulla olisi muutama kysymys Krapin bootcapmista', },
        /* 1*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Voit keskustella minun kanssani painamalla alla olevia vaihtoehtoja. Kaikki vastaukset ovat täysin anonyymejä, jotenka voit vastata niihin huoletta', },
        /* 2*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Haluan vastata Krapin kyselyyn', },

        /* 3*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Työstimme eilen oppiraportteja. Missä vaiheessa arvioisit teidän raporttinne olevan?', },
        /* 4*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Sen on valmis', },
        /* 5*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Viimeistelyä vaille valmis', },
        /* 6*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Se on noin puolivälissä', },
        /* 7*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Vasta alkuvaiheissa', },

        /* 8*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Miten arvioisitte eilisen illallisen?', },
        /* 9*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: '⭐⭐⭐⭐⭐', },
        /*10*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: '⭐⭐⭐⭐', },
        /*11*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: '⭐⭐⭐', },
        /*12*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: '⭐⭐', },
        /*13*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: '⭐', },

        /*14*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Monta tuntia sait nukuttua viime yönä?', },
        /*15*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Yli 8 tuntia', },
        /*16*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: '6-8 tuntia', },
        /*17*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: '4-6 tuntia', },
        /*18*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Alle 4 tuntia', },

        /*19*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Hienoa!', },
        /*20*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Muutaman päivän selviää hieman alhaisemmalla unimäärällä, mutta pidemmän päälle kannattaa nukkua yli kahdeksan tuntia päivässä. Jos päivän aikana alkaa väsyttämään, niin kannattaa harkita lyhyitä 10 minuutin päiväunia', },
        /*21*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Yöunien suositeltu mitta on vähintään kahdeksan tuntia. Jo yhden tunnin ylimääräinen yöuni saa ihmeitä aikaan, olet virkeämpi, innovatiivisempi ja muisti lakkaa pätkimästä.', },
        /*22*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Jos olet autolla matkassa, niin kannattaa ottaa päiväunet ennen lähtöä. Vähäisten yöunien vaikutus ajamiseen on verrattavissa humalatilaan', },

        /*23*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Asteikolla 1-5, miten yleisesti arvioisit minun kanssani keskustelemista?', },
        /*24*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: '5', },
        /*25*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: '4', },
        /*26*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: '3', },
        /*27*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: '2', },
        /*28*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: '1', },

        /*29*/{ id: nanoid(), class: 'user', pos: { x: 0, y: 0 }, label: 'Kiitos vastauksistasi, ja mukavaa päivänjatkoa!', },
    ];

    const edges = [
        // Intro
        { from: nodes[0].id, to: nodes[1].id },
        { from: nodes[1].id, to: nodes[2].id },

        // Raports
        { from: nodes[2].id, to: nodes[3].id },
        { from: nodes[3].id, to: nodes[4].id },
        { from: nodes[3].id, to: nodes[5].id },
        { from: nodes[3].id, to: nodes[6].id },
        { from: nodes[3].id, to: nodes[7].id },
    ];

    return { nodes, edges };
}


export { projectNameToId, getUser, testData };