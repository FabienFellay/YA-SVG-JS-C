#!/usr/bin/env python3

'''Automatically generate the standalone SVG files based on the modular ones.
   
   This embeds all the required scripts in the output SVG files, thus making
   them behave like standalone applications.
   
   Fabien Fellay, 2019
'''

# %% Imports

import shutil
import io
import os
import glob

# %% Script function: getEmbeddedFileContentStr

def getEmbeddedFileContentStr(filename):
    '''Output the filename content in a string (add <![CDATA[ and ]]>).'''
    
    # Read the script in a single string
    fscript_r = io.open(filename,'r')
    content_script = fscript_r.read()
    fscript_r.close()
    
    # Add CDATA tag and close script tag
    content_script = '<![CDATA[\n' + content_script
    if content_script[-1] != '\n':
        content_script = content_script + '\n'
    content_script = content_script + ']]>\n' + '  </script>\n'
    
    # Return the file content with the needed tags in a string
    return content_script;

# %% Script function: EmbedFileContent//

def EmbedFileContent(content_svg,file_len,startind,input_path,output_filename):
    '''Replace the content of the first script tag found, starting from the input index.'''
    
    # Messages strings
    no_script_msg = '    The input SVG has no script tag.'
    invalid_xml_msg = '    The input SVG is not well-formed (invalid XML).'
    already_written_msg = '    Script tag already written.'
    
    # Get the first index where the <script> tag opens
    i = startind
    while (i != file_len) and ('<script' not in content_svg[i]):
        i += 1
    if i == file_len:
        if startind == 0:
            print(no_script_msg)
        return content_svg, file_len;
    else:
        opentag = i
    
    # Get the first index where the <script> tag closes
    while (i != file_len) and ('/>' not in content_svg[i]) and ('</script>' not in content_svg[i]):
        i += 1
    if i == file_len:
        print(invalid_xml_msg)
        return content_svg, file_len;
    elif '</script>' in content_svg[i]:
        print(already_written_msg)
        return content_svg, file_len;
    else:
        closetag = i
    
    # Replace the closing <script> tag
    content_svg[closetag] = content_svg[closetag].replace('/>', '>').replace(' >','>')
    
    # Get the index for the next tag
    nexttag = closetag+1
    
    # Empty content script in case of errors
    empty_content_script = '<![CDATA[\n' + ']]>\n' + '  </script>\n'
    
    # Get the script filename
    i = opentag
    while (i <= closetag) and ('xlink:href' not in content_svg[i]):
        i += 1
    if i > closetag:
        print(invalid_xml_msg)
        content_svg.insert(nexttag,empty_content_script)
        return content_svg, nexttag;
    else:
        href_link = i
        embedded_filename = content_svg[i].split('"')[1] # Assume there is at least one "
    
    # Get the file content with the needed tags
    embedded_filename = embedded_filename
    content_script = getEmbeddedFileContentStr(input_path + embedded_filename)
    
    # Replace the script id
    i = opentag
    while (i <= closetag) and ('id' not in content_svg[i]):
        i += 1
    if i > closetag:
        print(invalid_xml_msg)
        content_svg.insert(nexttag,empty_content_script)
        return content_svg, nexttag;
    else:
        str_list = content_svg[i].split('"') # Assume there is at least one "
        str_list[1] = embedded_filename
        content_svg[i] = '"'.join(str_list)
    
    # Add the script content
    content_svg.insert(nexttag,content_script)
    
    # Remove the script href link
    del content_svg[href_link]
    
    # Modify the document name tag
    i = 0
    while (i != file_len) and ('sodipodi:docname' not in content_svg[i]):
        i += 1
    if i != file_len:
        str_list = content_svg[i].split('"') # Assume there is at least one "
        str_list[1] = output_filename
        content_svg[i] = '"'.join(str_list)
    
    # Message
    print('    ' + embedded_filename + ' script added.')
    
    # Return the modified content and the index for the next script tag
    return content_svg, nexttag;

# %% Script function: CreateStandalone

def CreateStandalone(input_filename,input_path,output_path):
    '''Create a standalone SVG output file based on the provided input SVG file.'''
    
    # Output file
    output_filename = os.path.splitext(input_filename)[0] + '_Standalone.svg'
    
    # Input and output full names
    input_pathname = input_path + input_filename
    output_pathname = output_path + output_filename
    
    # Message
    print('\n' + input_filename + ' to ' + output_filename + ':')
    
    # First, copy (and overwrite) the SVG artwork
    shutil.copyfile(input_pathname,output_pathname)
    
    # Read the standalone SVG artwork in a list at each newline
    fsvg_r = io.open(output_pathname,'r')
    content_svg = fsvg_r.readlines()
    fsvg_r.close()
    
    # Replace each script tag
    file_len = len(content_svg)
    ind = 0
    while ind != file_len:
        content_svg, ind = EmbedFileContent(content_svg,file_len,ind,input_path,output_filename)
    
    # Write the final standalone SVG artwork
    fsvg_w =  io.open(output_pathname,'w',newline='\n')
    fsvg_w.writelines(content_svg)
    fsvg_w.close()

# %% Script body

# Input and output path
input_path = './modular/'
output_path = './standalone/'

# Input files list
input_list = glob.glob(input_path + '*.svg')

# Generate standalone files
for k in range(0,len(input_list)):
    input_filename = os.path.basename(input_list[k])
    CreateStandalone(input_filename,input_path,output_path)

'''
   Do not edit the generated standalone files with Inkscape 0.94.2 as the
   embedded scripts will be reformatted without the <![CDATA[ ... ]]> tag, which
   leads to increased files size with less readability of the embedded scripts.
'''
