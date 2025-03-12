/**
 * Converts a numeric spell level into an ordinal string or "Cantrip" if level 0.
 */
export function getSpellLevelString(level) {
  if (level === 0) return "Cantrip";
  const ordinalSuffix = (n) => {
    let j = n % 10, k = n % 100;
    if (j === 1 && k !== 11) return n + "st level";
    if (j === 2 && k !== 12) return n + "nd level";
    if (j === 3 && k !== 13) return n + "rd level";
    return n + "th level";
  };
  return ordinalSuffix(level);
}

/**
 * Maps abbreviated spell school codes to their full names.
 */
export function getSpellSchool(schoolCode) {
  const mapping = {
    "abj": "Abjuration",
    "con": "Conjuration",
    "div": "Divination",
    "enc": "Enchantment",
    "evo": "Evocation",
    "ill": "Illusion",
    "nec": "Necromancy",
    "trs": "Transmutation"
  };
  return mapping[schoolCode] || schoolCode;
}

/**
 * Formats the activation/casting time information.
 */
export function formatCastingTime(activation, itemType) {
  if (!activation || !activation.type) return "N/A";
  const type = activation.type.charAt(0).toUpperCase() + activation.type.slice(1);
  return activation.value ? `${activation.value} ${type}` : type;
}

/**
 * Formats the target details for spells or features.
 */
export function formatSpellTarget(target, itemType) {
  if (!target) return "N/A";
  
  // Special handling for self-targeting (e.g. feats or equipment)
  if ((itemType === "feat" || itemType === "equipment") && target.affects?.type?.toLowerCase() === "self") {
    return "Self";
  }
  
  // Template targeting (commonly used with spells)
  if (target.template?.type) {
    const type = target.template.type.charAt(0).toUpperCase() + target.template.type.slice(1);
    return target.template.size && target.template.units 
      ? `${target.template.size} ${target.template.units} ${type}`.trim()
      : type;
  }
  
  // Creature or object targeting
  if (target.affects?.type) {
    // Add spaces between concatenated words (e.g., "CreatureObject" -> "Creature Object")
    let type = target.affects.type
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^\s+/, '') // Remove leading space
      .trim(); // Remove any trailing space
    
    // Ensure first letter is capitalized
    type = type.charAt(0).toUpperCase() + type.slice(1);
    
    // Move count to the front if it exists
    const count = target.affects.count ? `${target.affects.count} ` : "";
    const special = target.affects.special ? ` ${target.affects.special}` : "";
    return `${count}${type}${special}`.trim();
  }
  
  return "N/A";
}

/**
 * Formats a property value that might contain measurements or special values.
 */
export function formatSpellProperty(prop, itemType) {
  if (!prop) return "N/A";
  
  const propStr = String(prop.value || prop.units || prop.special).toLowerCase();
  if (propStr === "self") return "Self";
  if (propStr === "touch") return "Touch";
  
  // Weapon-specific formatting
  if (itemType === "weapon") {
    if (prop.reach && prop.value) {
      return `${prop.reach} ${prop.units} • ${prop.value}/${prop.long} ${prop.units}`.trim();
    }
    if (prop.value && prop.long) {
      return `${prop.value}/${prop.long} ${prop.units}`.trim();
    }
    if (prop.reach) {
      return `${prop.reach} ${prop.units}`.trim();
    }
  }
  
  // Generic formatting for value and units
  if (prop.value && prop.units) {
    const measurementUnits = ['ft', 'feet', 'mi', 'mile', 'miles', 'm', 'meter', 'meters', 'km', 'yards', 'yd'];
    const firstWord = String(prop.value).toLowerCase();
    if (!measurementUnits.includes(firstWord)) {
      return `${String(prop.value).charAt(0).toUpperCase() + String(prop.value).slice(1)} ${prop.units}`.trim();
    }
    return `${prop.value} ${prop.units}`.trim();
  } else if (prop.value != null && prop.value !== "") {
    return String(prop.value).charAt(0).toUpperCase() + String(prop.value).slice(1);
  } else if (prop.units) {
    if (prop.units.toLowerCase() === "inst") return "Instantaneous";
    if (prop.units.toLowerCase() === "touch") return "Touch";
    return prop.units;
  } else if (prop.special) {
    return prop.special;
  }
  
  return "N/A";
}

/**
 * Gets the preparation mode string for spells.
 */
export function getSpellPreparationMode(preparation) {
  if (!preparation) return "";
  
  const modes = {
    "prepared": "Prepared",
    "pact": "Pact Magic",
    "innate": "Innate",
    "always": "Always Prepared",
    "atwill": "At Will"
  };
  
  return modes[preparation.mode] || "";
}

/**
 * Extracts common details for an item (spell, weapon, feature, etc.) by looking
 * through its activities first (as per dnd5e 4.0) and then falling back to legacy system data.
 */
export function getItemDetails(itemData) {
  if (!itemData) return {
    castingTime: "N/A",
    range: "N/A",
    target: "N/A",
    duration: "N/A",
    preparation: ""
  };

  const preparation = itemData.type === "spell" ? getSpellPreparationMode(itemData.system?.preparation) : "";
  const activities = itemData.system?.activities || {};

  const findActivity = (predicate) => {
    const entry = Object.entries(activities).find(([id, act]) => predicate(act));
    return entry ? { _id: entry[0], ...entry[1] } : null;
  };

  let actionActivity = null;
  if (itemData.type === "weapon") {
    actionActivity = findActivity(act => act.type === "attack");
  }
  if (!actionActivity && Object.keys(activities).length > 0) {
    const firstId = Object.keys(activities)[0];
    actionActivity = { _id: firstId, ...activities[firstId] };
  }

  const activation = actionActivity && actionActivity.activation
    ? {
        type: actionActivity.activation.type || "none",
        value: actionActivity.activation.value,
        condition: actionActivity.activation.condition || "",
        activityId: actionActivity._id
      }
    : {
        type: itemData.system?.activation?.type || "none",
        value: itemData.system?.activation?.value,
        condition: itemData.system?.activation?.condition || ""
      };

  let range = {};
  if (actionActivity && actionActivity.range && !actionActivity.range.override) {
    range = {
      value: actionActivity.range.value || "",
      units: actionActivity.range.units || "",
      special: actionActivity.range.special || "",
      long: actionActivity.range.long || null,
      reach: itemData.system?.range?.reach || null,
      activityId: actionActivity._id
    };
  } else {
    range = {
      value: itemData.system?.range?.value || "",
      units: itemData.system?.range?.units || "",
      special: itemData.system?.range?.special || "",
      long: itemData.system?.range?.long || null,
      reach: itemData.system?.range?.reach || null
    };
  }

  let target = {};
  if (actionActivity && actionActivity.target && !actionActivity.target.override) {
    target = {
      ...actionActivity.target,
      activityId: actionActivity._id
    };
  } else {
    target = itemData.system?.target || {};
  }

  let duration = {};
  if (actionActivity && actionActivity.duration && !actionActivity.duration.override) {
    duration = {
      ...actionActivity.duration,
      activityId: actionActivity._id
    };
  } else {
    duration = itemData.system?.duration || {};
  }

  return {
    castingTime: formatCastingTime(activation, itemData.type),
    range: formatSpellProperty(range, itemData.type),
    target: formatSpellTarget(target, itemData.type),
    duration: formatSpellProperty(duration, itemData.type),
    activityId: actionActivity?._id,
    activity: actionActivity,
    preparation
  };
}

/**
 * Enriches HTML using Foundry's TextEditor, then removes inline styles.
 * This preserves interactive functionality like dice roll bindings.
 * @param {string} text - The raw description text.
 * @param {Object} rollData - The roll data context.
 * @returns {Promise<string>} The cleaned enriched HTML.
 */
export async function enrichHTMLClean(text, rollData = {}) {
  const rawHTML = await TextEditor.enrichHTML(text, {
    rollData,
    secrets: false,
    entities: true,
    async: true
  });
  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = rawHTML;
  // Remove inline styles while preserving classes and data attributes
  tempContainer.querySelectorAll("[style]").forEach(el => el.removeAttribute("style"));
  return tempContainer.innerHTML;
}