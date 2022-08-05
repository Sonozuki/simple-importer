Hooks.on('renderJournalDirectory', (directory, html) => {
    // add custom button
    let actionButtonsHeaderRow = html.find('div.header-actions');
    actionButtonsHeaderRow.append(`<button id="import-journal-data-button"><i class="fas fa-book"></i> Import Journal Data</button>`);

    html.on('click', '#import-journal-data-button', (event) => {
        SimpleImporter.importJournalDataConfig.render(true);
    });
});

Hooks.on('renderRollTableDirectory', (directory, html) => {
    // add custom button
    let actionButtonsHeaderRow = html.find('div.header-actions');
    actionButtonsHeaderRow.append(`<button id="import-table-data-button"><i class="fas fa-book"></i> Import Rollable Table Data</button>`);

    html.on('click', '#import-table-data-button', (event) => {
        SimpleImporter.importRollableTableDataConfig.render(true);
    });
});

Hooks.on('init', () => SimpleImporter.initialise());

/**
 * Represents the simple-importer module.
 */
class SimpleImporter {
    /**
     * The id of the module.
     */
    static MODULE_ID = 'simple-importer';

    /**
     * The handlebar templates for the module.
     */
    static TEMPLATES = {
        /**
         * The template for ImportJournalDataConfig.
         */
        DATA_IMPORT: `modules/${this.MODULE_ID}/templates/data-import.hbs`
    }

    /**
     * Initialises the module.
     */
    static initialise() {
        this.importJournalDataConfig = new ImportJournalDataConfig();
        this.importRollableTableDataConfig = new ImportRollableTableDataConfig();
    }
}

/**
 * Represents the simple-importer utilities.
 */
class SimpleImporterUtilities {
    /**
     * Tries to parse a json string to a json blob. If the string is unable to be parsed, a notification is created and the error is printed.
     * @param {String} jsonString The json string to try and parse.
     * @returns The parsed object, if it could be parsed; otherwise, undefined.
     */
    static parseJson(jsonString) {
        try {
            return JSON.parse(jsonString);
        }
        catch (exception) {
            ui.notifications.error('Failed to parse JSON, error printed in console.');
            console.error(SimpleImporter.MODULE_ID, '|', exception);
        }
    }

    /**
     * Checks if an object is valid using a custom predicate.
     * @param {*} object The object to validate. This can either be an object or an array of objects.
     * @returns true, if the object is valid; otherwise, false.
     */
    static validateImportedObject(object) {
        let entriesValid = true;

        const isArray = Array.isArray(object);
        if (isArray) {
            if (object.length === 0) {
                ui.notifications.error('Array contains no entries.')
                entriesValid = false;
            }

            for (let entry of object)
                if (!this.validateObject(entry))
                    entriesValid = false;
        }
        else
            if (!this.validateObject(object))
                entriesValid = false;

        if (!entriesValid)
            ui.notifications.error('Aborting import, fix issues and try again.');

        return entriesValid;
    }

    /**
     * Imports an object using a custom import function.
     * @param {*} object The object to import. This can either be an object or an array of objects.
     * @param {*} importObjectAction A function used to import an object.
     */
    static async importObject(object, importObjectAction) {
        const isArray = Array.isArray(object);
        if (isArray)
            for (let entry of object)
                await importObjectAction(entry);
        else
            await importObjectAction(object);
    }

    /**
     * Checks to see whether a journal entry or rollable table is valid.
     * @param {JournalEntryData|RollTableData} object The journal entry or rollable table to ensure is valid.
     * @returns true, if the object is valid; otherwise, false.
     */
    static validateObject(object) {
        const isValid = object.name && /\S/.test(object.name);
        if (!isValid)
            ui.notifications.error(`Object: "${JSON.stringify(object)}" is invalid (must have populated "name" field).`);

        return isValid;
    }
}

/**
 * The form for importing journal data.
 */
class ImportJournalDataConfig extends FormApplication {
    /**
     * Retrieves the default options for the form.
     */
    static get defaultOptions() {
        let overrides = {
            height: 'auto',
            id: 'import-journal-data',
            template: SimpleImporter.TEMPLATES.DATA_IMPORT,
            title: 'Import Journal Data'
        };

        return foundry.utils.mergeObject(super.defaultOptions, overrides);
    }

    /**
     * Subscribes event handlers for the form.
     * @param {*} html The html of the form.
     */
    activateListeners(html) {
        super.activateListeners(html);

        html.on('click', '#import-button', this._handleImportButtonClick.bind(this));
    }

    /**
     * Invoked when the import button is clicked.
     * @param {*} event The event data.
     */
    async _handleImportButtonClick(event) {
        // ensure data was supplied
        const importData = $(event.currentTarget).siblings('textarea').val();
        if (!importData)
            return;

        // ensure the data is valid json
        let input = SimpleImporterUtilities.parseJson(importData);
        if (!input)
            return;

        // validate journal entries
        if (!SimpleImporterUtilities.validateImportedObject(input))
            return;

        // import journal entries
        await SimpleImporterUtilities.importObject(input, async (object) => await JournalEntry.create(object));

        ui.notifications.info('Journal entries successfully created.');
        await SimpleImporter.importJournalDataConfig.close();
    }
}

/**
 * The form for importing rollable table data.
 */
class ImportRollableTableDataConfig extends FormApplication {
    /**
     * Retrieves the default options for the form.
     */
    static get defaultOptions() {
        let overrides = {
            height: 'auto',
            id: 'import-table-data',
            template: SimpleImporter.TEMPLATES.DATA_IMPORT,
            title: 'Import Rollable Table Data'
        };

        return foundry.utils.mergeObject(super.defaultOptions, overrides);
    }

    /**
     * Subscribes event handlers for the form.
     * @param {*} html The html of the form.
     */
    activateListeners(html) {
        super.activateListeners(html);

        html.on('click', '#import-button', this._handleImportButtonClick.bind(this));
    }

    /**
     * Invoked when the import button is clicked.
     * @param {*} event The event data.
     */
    async _handleImportButtonClick(event) {
        // ensure data was supplied
        const importData = $(event.currentTarget).siblings('textarea').val();
        if (!importData)
            return;

        // ensure the data is valid json
        let input = SimpleImporterUtilities.parseJson(importData);
        if (!input)
            return;

        // validate tables
        if (!SimpleImporterUtilities.validateImportedObject(input))
            return;

        // import tables
        await SimpleImporterUtilities.importObject(input, async (object) => await RollTable.create(object));

        ui.notifications.info('Rollable tables successfully created.');
        await SimpleImporter.importRollableTableDataConfig.close();
    }
}