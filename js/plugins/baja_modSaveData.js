// by bajamaid i know its very rough sorry
// PLUGIN PARAMETERS THAT GO IN modsavedata.YAML
// modId: MUST BE THE ID OF YOUR MOD!
// saveName: The name the plugin will give to your saves when mod isn't active (optional)
// dummyFace: The face the game will default to when mod isn't active (optional, must be a file in vanilla img/faces)

const vanillasavefaces = ["01_OMORI_BATTLE", "02_AUBREY_BATTLE", "03_KEL_BATTLE", "04_HERO_BATTLE", "01_FA_OMORI_BATTLE", "02_FA_AUBREY_BATTLE", "03_FA_KEL_BATTLE", "04_FA_HERO_BATTLE"];

class Yosafire {

  static failsafe_name() {
    // failsafe_name: change this to the name of the image you want to use for "invalid" saves.
    return ("invalid");
  }

  static isReverieSave(save) {
    let info = save;
    if (info.dummyrevChapter) {
      return true;
    } else {
      return false;
    }
  }

  static copySavePortrait(faceName) {
    const fs = require('fs');
    const path = require("path");
    const base = path.dirname(process.mainModule.filename);
    var dir = `${base}/save/modportraits`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    if (!fs.existsSync(`${base}/save/modportraits/${faceName}.rpgmvp`)) {
      let portraitData = fs.readFileSync(`${base}/img/faces/${faceName}.rpgmvp`);
      fs.writeFileSync(`${base}/save/modportraits/${faceName}.rpgmvp`, portraitData);
    }
  }

  static reservePortraits() {
    const fs = require('fs');
    const path = require("path");
    const base = path.dirname(process.mainModule.filename);
    var dir = `${base}/save/modportraits`;
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (let i = 0; i < files.length; i++) {
        if (files[i].includes(".rpgmvp")) {
          let newfilename = files[i].replace(".rpgmvp", "");
          ImageManager.reserveFace(newfilename, 0, this.imageReservationId);
        }
      }
    };
    ImageManager.reserveFace("oneloader_invalid_save", 0, this.imageReservationId);
  }

  static getDummyInfo() {
    let info = {
      dummyFace: 0,
      saveName: 0
    };
    if ($gameSystem._dummyFace) {
      info.dummyFace = $gameSystem._dummyFace;
    }
    if ($gameSystem._modSaveName) {
      info.saveName = $gameSystem._modSaveName;
    }
    return info;
  }

  static setDummyInfo(dummyFace, saveName) {
    $gameSystem._dummyFace = dummyFace;
    $gameSystem._modSaveName = saveName;
  }

  static isModSaveFace(faceName) {
    if (vanillasavefaces.includes(faceName)) {
      return false;
    } else {
      return true;
    };
  }

  static noSavePortraitCopy(faceImage) {
    const fs = require('fs');
    const path = require("path");
    const base = path.dirname(process.mainModule.filename);
    if (!fs.existsSync(`${base}/save/modportraits/${faceImage}.rpgmvp`)) {
    return true;
    } else {
      return false;
    };
  }

  static cleanInfo(info) {

    let cleanedinfo = info;
    var actor = cleanedinfo.actorData;
    // face code
    let faceSpriteData = actor.faceName;
    if (actor.realFaceName && saveFileFaceExists_new(actor.realFaceName)) {
      faceSpriteData = actor.realFaceName;
    }
    if ((!saveFileFaceExists_new(faceSpriteData)) || (!saveFileFaceExists_new(actor.realFaceName) && cleanedinfo.isModSaveFile && actor.faceName === "01_FA_OMORI_BATTLE")) {
      if (Yosafire.failsafe_name() !== "invalid") {
        faceSpriteData = Yosafire.failsafe_name();
      } else {
        faceSpriteData = "oneloader_invalid_save";
      }
    };

    cleanedinfo.actorData.faceName = faceSpriteData;

    // chapter code

    let chapterData = cleanedinfo.chapter;

    if (typeof cleanedinfo.realChapter !== "undefined") {
      chapterData = cleanedinfo.realChapter;
    } else {
      chapterData = cleanedinfo.chapter;
    }

    cleanedinfo.chapter = chapterData;
    return cleanedinfo;

  }
};


const default_loadsavefileinfo = DataManager.loadSavefileInfo;
const default_reserveFace = ImageManager.reserveFace;
const default_loadFace = ImageManager.loadFace;
const default_save_loadreservedbitmaps = Scene_OmoriFile.prototype.loadReservedBitmaps;
const default_makesavefileinfo = DataManager.makeSavefileInfo;

DataManager.loadSavefileInfo = function(savefileId) {
    var info = default_loadsavefileinfo.call(this, savefileId)
    if (info !== null) {
      return Yosafire.cleanInfo(info);
    }
};

Scene_OmoriFile.prototype.loadReservedBitmaps = function() {
  // Super Call
  default_save_loadreservedbitmaps.call(this);
  Yosafire.reservePortraits();
};

ImageManager.reserveFace = function(...args) {
    if (!saveFileFaceExists_OG(args[0]) && saveFileFaceExists_new(args[0])) {
        return this.reserveBitmap('save/modportraits/', args[0], args[1], true, args[2]);
    }
    return default_reserveFace.apply(this, args);
};

ImageManager.loadFace = function(...args) {
    if (!saveFileFaceExists_OG(args[0]) && saveFileFaceExists_new(args[0])) {
        return this.loadBitmap('save/modportraits/', args[0], args[1], true);
    }
    return default_loadFace.apply(this, args);
};


hasModSaveFile = function() {
    let yamlData = LanguageManager._data.en.text;
    if (Object.keys(yamlData).includes('modsavedata')) {
        return true;
    }
    else {
        return false;
    };

};

Game_Actor.prototype.faceSaveLoad_DONOTCHANGE = function() {
  var actor = this.actor();
  // When changing these the .png should not be required.
  switch (actor.id) {
    case 1: // Omori
    return "01_OMORI_BATTLE";
    case 2: // Aubrey
    return "02_AUBREY_BATTLE";
    case 3: // Kel
    return "03_KEL_BATTLE";
    case 4: // Hero
    return "04_HERO_BATTLE";
    case 8: // Omori
    return "01_FA_OMORI_BATTLE";
    case 9: // Aubrey
    return "02_FA_AUBREY_BATTLE";
    case 10: // Kel
    return "03_FA_KEL_BATTLE";
    case 11: // Hero
    return "04_FA_HERO_BATTLE";
    default:
      return "default_face_image_here"; // if ther is one?
  }
};

saveFileFaceExists_new = function(faceImage) {
  const fs = require('fs');
  const path = require("path");
  const base = path.dirname(process.mainModule.filename);
  if (fs.existsSync(`${base}/img/faces/` + faceImage + '.png') || fs.existsSync(`${base}/img/faces/` + faceImage + '.rpgmvp') || fs.existsSync(`${base}/save/modportraits/${faceImage}.rpgmvp`)) {
   return true;
  } else {
    return false;
  };
};

saveFileFaceExists_OG = function(faceImage) {
  const fs = require('fs');
  const path = require("path");
  const base = path.dirname(process.mainModule.filename);
  if (fs.existsSync(`${base}/img/faces/` + faceImage + '.png') || fs.existsSync(`${base}/img/faces/` + faceImage + '.rpgmvp')) {
   return true;
  } else {
    return false;
  };
};

DataManager.makeSavefileInfo = function() {
    // Get Original Info
    var info = default_makesavefileinfo.call(this);
    // Get Leader
    var actor = $gameParty.leader();
    var dummyinfo = Yosafire.getDummyInfo();
    if (info.actorData.realFaceName && Yosafire.isModSaveFace(info.actorData.realFaceName)) {
      Yosafire.copySavePortrait(info.actorData.faceName);
    }
    if (Yosafire.isModSaveFace(info.actorData.faceName)) {
      info.isModSaveFile = true;
      Yosafire.copySavePortrait(info.actorData.faceName);
      if (typeof dummyinfo.dummyFace === "string") {
        info.actorData.realFaceName = info.actorData.faceName;
        info.actorData.faceName = dummyinfo.dummyFace;
      } else {
        info.actorData.realFaceName = info.actorData.faceName;
        info.actorData.faceName = "01_FA_OMORI_BATTLE";
      };
    }
    if (typeof dummyinfo.saveName === "string") {
      info.chapter = dummyinfo.saveName 
      info.realChapter = $gameVariables.value(23);
    }
    return info;
};